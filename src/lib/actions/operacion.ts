"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import { crearNotificacion } from "@/lib/notificaciones/crear";
import {
  MONEDA_OPERACION,
  aCentimos,
  comisionCentimos,
} from "@/lib/operacion/comision";
import {
  confirmarPagoOperacion,
  liberarOperacionCore,
} from "@/lib/operacion/otorgar";

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Listing types eligible for secure payment (physical/transferable assets).
const TIPOS_CON_PAGO = new Set(["MAQUINARIA", "TRASPASO"]);

// Buyer starts a secure purchase: creates the operacion + a Stripe Checkout that
// charges into Bellezista's account (funds held until release). Requires the
// seller to have payouts activated so the money can be transferred later.
export async function crearCheckoutCompra(
  anuncioId: string,
): Promise<{ url?: string; error?: string }> {
  const compradorId = await getUserId();
  if (!compradorId) return { error: "Inicia sesión para comprar." };

  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: {
      id: true,
      tipo: true,
      titulo: true,
      precio: true,
      estado: true,
      propietarioId: true,
      propietario: { select: { cobrosActivos: true } },
    },
  });
  if (!anuncio) return { error: "El anuncio no existe." };
  if (!TIPOS_CON_PAGO.has(anuncio.tipo)) {
    return { error: "Este anuncio no admite pago seguro." };
  }
  if (anuncio.propietarioId === compradorId) {
    return { error: "No puedes comprar tu propio anuncio." };
  }
  if (anuncio.estado !== "ACTIVO" && anuncio.estado !== "DESTACADO") {
    return { error: "Este anuncio ya no está disponible." };
  }
  if (!anuncio.propietario.cobrosActivos) {
    return {
      error:
        "El vendedor todavía no tiene los cobros activados. Escríbele por mensaje mientras tanto.",
    };
  }

  const brutoCentimos = aCentimos(anuncio.precio.toString());
  const comisionEuros = comisionCentimos(brutoCentimos) / 100;

  const operacion = await prisma.operacion.create({
    data: {
      anuncioId: anuncio.id,
      propietarioId: anuncio.propietarioId,
      compradorId,
      precioFinal: anuncio.precio,
      comision: comisionEuros,
      estadoOperacion: "PENDIENTE_DE_PAGO",
    },
    select: { id: true },
  });

  const base = await getBaseUrl();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: MONEDA_OPERACION,
            product_data: { name: anuncio.titulo },
            unit_amount: brutoCentimos,
          },
          quantity: 1,
        },
      ],
      // Separate charges & transfers: charge into the platform account now, hold
      // the funds, transfer to the seller on release. Tag the PI so we can find
      // the operacion from the charge later.
      payment_intent_data: { metadata: { operacionId: operacion.id } },
      success_url: `${base}/mis-compras?compra=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/anuncios/${anuncio.id}?compra=cancel`,
      client_reference_id: compradorId,
      metadata: {
        tipo: "operacion",
        operacionId: operacion.id,
        compradorId,
      },
    });

    await prisma.operacion.update({
      where: { id: operacion.id },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url ?? undefined };
  } catch (e) {
    // Roll back the dangling operacion so it doesn't linger as pending.
    await prisma.operacion.delete({ where: { id: operacion.id } }).catch(() => {});
    const msg = e instanceof Error ? e.message : "error";
    return { error: `No se pudo iniciar el pago: ${msg}` };
  }
}

// Belt-and-suspenders confirmation from the buyer's success redirect.
export async function confirmarCompra(sessionId: string): Promise<boolean> {
  const compradorId = await getUserId();
  if (!compradorId) return false;
  const ok = await confirmarPagoOperacion(sessionId, compradorId);
  if (ok) revalidatePath("/mis-compras");
  return ok;
}

// Buyer confirms receipt -> release the held funds to the seller.
export async function liberarOperacion(
  operacionId: string,
): Promise<{ ok?: boolean; error?: string }> {
  const userId = await getUserId();
  if (!userId) return { error: "Inicia sesión." };

  const op = await prisma.operacion.findUnique({
    where: { id: operacionId },
    select: { compradorId: true },
  });
  if (!op) return { error: "La operación no existe." };
  if (op.compradorId !== userId) return { error: "No es tu compra." };

  try {
    await liberarOperacionCore(operacionId);
    revalidatePath("/mis-compras");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo liberar el pago." };
  }
}

// Buyer opens an incidencia (dispute) during the review window. Stops
// auto-release; SoluciónOK resolves it by hand from the admin panel.
export async function abrirIncidencia(
  operacionId: string,
  motivo: string,
): Promise<{ ok?: boolean; error?: string }> {
  const userId = await getUserId();
  if (!userId) return { error: "Inicia sesión." };

  const op = await prisma.operacion.findUnique({
    where: { id: operacionId },
    select: { compradorId: true, propietarioId: true, estadoOperacion: true },
  });
  if (!op) return { error: "La operación no existe." };
  if (op.compradorId !== userId) return { error: "No es tu compra." };
  if (op.estadoOperacion !== "PAGADO_EN_REVISION") {
    return { error: "Solo puedes abrir una incidencia mientras el pago está en revisión." };
  }

  await prisma.operacion.update({
    where: { id: operacionId },
    data: {
      estadoOperacion: "INCIDENCIA_ABIERTA",
      motivoIncidencia: motivo.trim().slice(0, 1000) || null,
    },
  });
  await crearNotificacion(op.propietarioId, {
    tipo: "operacion",
    titulo: "Incidencia abierta en tu venta",
    cuerpo: "El comprador ha abierto una incidencia. La revisaremos y te contactaremos.",
    url: "/mis-ventas",
  });
  revalidatePath("/mis-compras");
  return { ok: true };
}

export async function getMisCompras() {
  const userId = await getUserId();
  if (!userId) return [];
  return prisma.operacion.findMany({
    where: { compradorId: userId },
    orderBy: { creadoEn: "desc" },
    include: {
      anuncio: { select: { id: true, titulo: true, fotos: true, tipo: true } },
    },
  });
}

export async function getMisVentas() {
  const userId = await getUserId();
  if (!userId) return [];
  return prisma.operacion.findMany({
    where: { propietarioId: userId },
    orderBy: { creadoEn: "desc" },
    include: {
      anuncio: { select: { id: true, titulo: true, fotos: true, tipo: true } },
    },
  });
}
