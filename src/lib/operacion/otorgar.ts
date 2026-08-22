import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";
import { crearNotificacion } from "@/lib/notificaciones/crear";
import {
  MONEDA_OPERACION,
  PLAZO_REVISION_DIAS,
  aCentimos,
  pagoVendedorCentimos,
} from "@/lib/operacion/comision";

// Marks an operacion as paid + in review when its Checkout session completes.
// Idempotent: only advances an operacion still PENDIENTE_DE_PAGO. Also reserves
// the listing so nobody else can buy it while the money is held.
export async function registrarPagoOperacion(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const operacionId = session.metadata?.operacionId;
  if (!operacionId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const op = await prisma.operacion.findUnique({
    where: { id: operacionId },
    select: { id: true, estadoOperacion: true, anuncioId: true, propietarioId: true },
  });
  if (!op || op.estadoOperacion !== "PENDIENTE_DE_PAGO") return;

  await prisma.$transaction([
    prisma.operacion.update({
      where: { id: operacionId },
      data: {
        estadoOperacion: "PAGADO_EN_REVISION",
        fechaPago: new Date(),
        plazoRevision: PLAZO_REVISION_DIAS,
        stripePaymentIntentId: paymentIntentId,
      },
    }),
    prisma.anuncio.update({
      where: { id: op.anuncioId },
      data: { estado: "RESERVADO" },
    }),
  ]);

  await crearNotificacion(op.propietarioId, {
    tipo: "operacion",
    titulo: "¡Han comprado tu anuncio!",
    cuerpo:
      "El pago está retenido de forma segura. Cuando el comprador confirme la recepción, recibirás el dinero.",
    url: "/mis-ventas",
  });
}

// Confirms an operacion from the buyer's success redirect (belt-and-suspenders
// vs the webhook). Returns true if it now reflects payment.
export async function confirmarPagoOperacion(
  sessionId: string,
  compradorId: string,
): Promise<boolean> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return false;
  }
  if (
    session.payment_status !== "paid" ||
    session.metadata?.tipo !== "operacion" ||
    session.metadata?.compradorId !== compradorId
  ) {
    return false;
  }
  await registrarPagoOperacion(session);
  return true;
}

// Releases a held operacion: transfers price - commission to the seller's
// connected account (tied to the original charge via source_transaction) and
// marks the listing sold. Shared by the buyer action, the admin action and the
// auto-release cron. Throws on any Stripe/DB failure so callers can surface it.
export async function liberarOperacionCore(operacionId: string): Promise<void> {
  const op = await prisma.operacion.findUnique({
    where: { id: operacionId },
    include: { propietario: { select: { stripeConnectId: true, cobrosActivos: true } } },
  });
  if (!op) throw new Error("La operación no existe.");
  if (
    op.estadoOperacion !== "PAGADO_EN_REVISION" &&
    op.estadoOperacion !== "INCIDENCIA_ABIERTA"
  ) {
    throw new Error("La operación no está en revisión.");
  }
  if (!op.propietario.stripeConnectId || !op.propietario.cobrosActivos) {
    throw new Error(
      "El vendedor todavía no tiene los cobros activados. No se puede liberar el pago.",
    );
  }
  if (!op.stripePaymentIntentId || !op.precioFinal) {
    throw new Error("Faltan datos del pago para liberar la operación.");
  }

  // The charge behind the payment intent -- ties the transfer to those funds.
  const pi = await stripe.paymentIntents.retrieve(op.stripePaymentIntentId);
  const chargeId =
    typeof pi.latest_charge === "string"
      ? pi.latest_charge
      : (pi.latest_charge?.id ?? null);
  if (!chargeId) throw new Error("No se encontró el cargo del pago.");

  const brutoCentimos = aCentimos(op.precioFinal.toString());
  const transfer = await stripe.transfers.create({
    amount: pagoVendedorCentimos(brutoCentimos),
    currency: MONEDA_OPERACION,
    destination: op.propietario.stripeConnectId,
    source_transaction: chargeId,
    metadata: { operacionId: op.id },
  });

  await prisma.$transaction([
    prisma.operacion.update({
      where: { id: op.id },
      data: {
        estadoOperacion: "LIBERADO",
        fechaLiberacion: new Date(),
        stripeTransferId: transfer.id,
      },
    }),
    prisma.anuncio.update({
      where: { id: op.anuncioId },
      data: { estado: "VENDIDO" },
    }),
  ]);

  await crearNotificacion(op.propietarioId, {
    tipo: "operacion",
    titulo: "Pago liberado",
    cuerpo: "El dinero de tu venta ya está en camino a tu cuenta.",
    url: "/mis-ventas",
  });
}

// Refunds a held operacion back to the buyer (incidencia resolution). Marks the
// listing available again.
export async function reembolsarOperacionCore(operacionId: string): Promise<void> {
  const op = await prisma.operacion.findUnique({ where: { id: operacionId } });
  if (!op) throw new Error("La operación no existe.");
  if (
    op.estadoOperacion !== "PAGADO_EN_REVISION" &&
    op.estadoOperacion !== "INCIDENCIA_ABIERTA"
  ) {
    throw new Error("Esta operación no se puede reembolsar.");
  }
  if (!op.stripePaymentIntentId) throw new Error("Faltan datos del pago.");

  await stripe.refunds.create({ payment_intent: op.stripePaymentIntentId });

  await prisma.$transaction([
    prisma.operacion.update({
      where: { id: op.id },
      data: { estadoOperacion: "REEMBOLSADO" },
    }),
    prisma.anuncio.update({
      where: { id: op.anuncioId },
      data: { estado: "ACTIVO" },
    }),
  ]);

  await crearNotificacion(op.compradorId, {
    tipo: "operacion",
    titulo: "Reembolso realizado",
    cuerpo: "Te hemos devuelto el importe de tu compra.",
    url: "/mis-compras",
  });
}

// Auto-releases operaciones whose review window has passed with no incidencia.
// Called by the daily cron. Returns how many were released / failed.
export async function autoLiberarOperacionesVencidas(): Promise<{
  liberadas: number;
  fallidas: number;
}> {
  const ahora = Date.now();
  const enRevision = await prisma.operacion.findMany({
    where: { estadoOperacion: "PAGADO_EN_REVISION", fechaPago: { not: null } },
    select: { id: true, fechaPago: true, plazoRevision: true },
  });

  let liberadas = 0;
  let fallidas = 0;
  for (const op of enRevision) {
    const dias = op.plazoRevision ?? PLAZO_REVISION_DIAS;
    const vence = op.fechaPago!.getTime() + dias * 24 * 60 * 60 * 1000;
    if (vence > ahora) continue;
    try {
      await liberarOperacionCore(op.id);
      liberadas++;
    } catch {
      fallidas++;
    }
  }
  return { liberadas, fallidas };
}
