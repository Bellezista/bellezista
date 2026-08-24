"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import { TALENTO_PACKS } from "@/lib/talento/precios";
import { crearNotificacion } from "@/lib/notificaciones/crear";

async function getUsuarioId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Whether `usuarioId` has an active unlimited-access pack (3/6/12 months).
export async function accesoIlimitadoActivo(usuarioId: string): Promise<boolean> {
  const c = await prisma.talentoCredito.findUnique({
    where: { usuarioId },
    select: { accesoIlimitadoHasta: true },
  });
  return Boolean(
    c?.accesoIlimitadoHasta && c.accesoIlimitadoHasta.getTime() > Date.now(),
  );
}

// True if a specific CV was permanently unlocked with a credit.
export async function estaDesbloqueado(
  usuarioId: string,
  cvId: string,
): Promise<boolean> {
  const d = await prisma.cvDesbloqueo.findUnique({
    where: { usuarioId_cvId: { usuarioId, cvId } },
    select: { id: true },
  });
  return Boolean(d);
}

// Whether `usuarioId` (a business owner) can see the full profile of `cvId`:
// either an active unlimited pack, or a credit-unlocked CV.
export async function tieneAccesoCv(
  usuarioId: string,
  cvId: string,
): Promise<boolean> {
  if (await accesoIlimitadoActivo(usuarioId)) return true;
  return estaDesbloqueado(usuarioId, cvId);
}

export async function getMiSaldoCreditos(): Promise<number> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return 0;
  const c = await prisma.talentoCredito.findUnique({
    where: { usuarioId },
    select: { saldo: true },
  });
  return c?.saldo ?? 0;
}

// Current Talento access for the logged-in business: credit balance + whether an
// unlimited pack is active (and until when). Used by the ficha CTA and the
// account counter (#4).
export async function getMiAccesoTalento(): Promise<{
  saldo: number;
  ilimitadoHasta: Date | null;
  usados: number;
}> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { saldo: 0, ilimitadoHasta: null, usados: 0 };
  const [c, usados] = await Promise.all([
    prisma.talentoCredito.findUnique({ where: { usuarioId } }),
    prisma.cvDesbloqueo.count({ where: { usuarioId } }),
  ]);
  const ilim =
    c?.accesoIlimitadoHasta && c.accesoIlimitadoHasta.getTime() > Date.now()
      ? c.accesoIlimitadoHasta
      : null;
  return { saldo: c?.saldo ?? 0, ilimitadoHasta: ilim, usados };
}

type CheckoutResult = { url?: string; error?: string };

// Stripe Checkout to buy a Talento access pack. The grant (credits or unlimited
// period) happens on payment via the webhook / success redirect.
export async function crearCheckoutPack(
  packId: string,
): Promise<CheckoutResult> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "Inicia sesión para comprar un pack." };

  const pack = TALENTO_PACKS[packId];
  if (!pack) return { error: "Pack no válido." };

  const base = await getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: pack.moneda,
          product_data: {
            name: `${pack.nombre} · Empleo & Talento`,
            description: pack.descripcion,
          },
          unit_amount: pack.importe,
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/talento?pack=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/talento?pack=cancel`,
    client_reference_id: usuarioId,
    metadata: { usuarioId, tipo: "talento_pack", packId: pack.id },
  });

  return { url: session.url ?? undefined };
}

// Spend one prepaid credit (Pack Inicio) to permanently unlock a CV. If the user
// has an active unlimited pack, no credit is spent -- access is already granted.
export async function desbloquearConCredito(
  cvId: string,
): Promise<{ ok?: boolean; error?: string }> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "Inicia sesión para desbloquear." };

  const cv = await prisma.cv.findUnique({
    where: { id: cvId },
    select: { id: true, usuarioId: true },
  });
  if (!cv) return { error: "El CV no existe." };
  if (cv.usuarioId === usuarioId) return { error: "Es tu propio CV." };

  // Already accessible (active unlimited pack or previously unlocked).
  if (await tieneAccesoCv(usuarioId, cvId)) {
    revalidatePath(`/talento/${cvId}`);
    return { ok: true };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Decrement only if there is balance; count guards against going negative.
      const res = await tx.talentoCredito.updateMany({
        where: { usuarioId, saldo: { gt: 0 } },
        data: { saldo: { decrement: 1 } },
      });
      if (res.count === 0) {
        throw new Error("SIN_SALDO");
      }
      await tx.cvDesbloqueo.create({ data: { usuarioId, cvId } });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "SIN_SALDO") {
      return { error: "No te quedan desbloqueos disponibles." };
    }
    throw e;
  }

  await crearNotificacion(cv.usuarioId, {
    tipo: "desbloqueo",
    titulo: "Han desbloqueado tu CV",
    cuerpo: "Un negocio ha accedido a tu perfil completo.",
    url: "/talento/mi-cv",
  });

  revalidatePath(`/talento/${cvId}`);
  return { ok: true };
}
