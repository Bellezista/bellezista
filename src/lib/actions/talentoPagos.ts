"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import {
  DESBLOQUEO_INDIVIDUAL,
  BONO_DESBLOQUEOS,
} from "@/lib/talento/precios";

async function getUsuarioId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Whether `usuarioId` (a business owner) can see the full profile of `cvId`.
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

export async function getMiSaldoCreditos(): Promise<number> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return 0;
  const c = await prisma.talentoCredito.findUnique({
    where: { usuarioId },
    select: { saldo: true },
  });
  return c?.saldo ?? 0;
}

type CheckoutResult = { url?: string; error?: string };

// Stripe Checkout for unlocking a single CV. Returns the hosted checkout URL to
// redirect to; the actual unlock is granted by the webhook on payment success.
export async function crearCheckoutDesbloqueo(
  cvId: string,
): Promise<CheckoutResult> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "Inicia sesión para desbloquear." };

  const cv = await prisma.cv.findUnique({
    where: { id: cvId },
    select: { id: true, usuarioId: true },
  });
  if (!cv) return { error: "El CV no existe." };
  if (cv.usuarioId === usuarioId) return { error: "Es tu propio CV." };
  if (await estaDesbloqueado(usuarioId, cvId)) {
    return { error: "Ya has desbloqueado este CV." };
  }

  const base = await getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: DESBLOQUEO_INDIVIDUAL.moneda,
          product_data: {
            name: DESBLOQUEO_INDIVIDUAL.nombre,
            description: DESBLOQUEO_INDIVIDUAL.descripcion,
          },
          unit_amount: DESBLOQUEO_INDIVIDUAL.importe,
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/talento/${cvId}?pago=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/talento/${cvId}?pago=cancel`,
    client_reference_id: usuarioId,
    metadata: { usuarioId, tipo: "individual", cvId },
  });

  return { url: session.url ?? undefined };
}

// Stripe Checkout for the bono (several unlock credits at once).
export async function crearCheckoutBono(): Promise<CheckoutResult> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "Inicia sesión para comprar el bono." };

  const base = await getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: BONO_DESBLOQUEOS.moneda,
          product_data: {
            name: BONO_DESBLOQUEOS.nombre,
            description: BONO_DESBLOQUEOS.descripcion,
          },
          unit_amount: BONO_DESBLOQUEOS.importe,
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/talento?bono=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/talento?bono=cancel`,
    client_reference_id: usuarioId,
    metadata: {
      usuarioId,
      tipo: "bono",
      creditos: String(BONO_DESBLOQUEOS.creditos),
    },
  });

  return { url: session.url ?? undefined };
}

// Spend one prepaid credit to unlock a CV, with no trip to Stripe. Atomic: the
// credit is only consumed if the unlock is actually created.
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
  if (await estaDesbloqueado(usuarioId, cvId)) {
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
      return { error: "No te quedan desbloqueos en el bono." };
    }
    throw e;
  }

  revalidatePath(`/talento/${cvId}`);
  return { ok: true };
}
