import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";

// Marks a Kit Traspaso as paid once its Checkout Session completes. Idempotent:
// only the pending record with no session id yet is advanced, so a retried
// webhook / redirect is a no-op.
export async function otorgarKitDesdeSesion(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const md = session.metadata ?? {};
  if (md.tipo !== "kit_traspaso" || !md.kitId) return;

  await prisma.kitTraspaso.updateMany({
    where: { id: md.kitId, estado: "pendiente_pago", stripeSessionId: null },
    data: {
      estado: "pagado",
      stripeSessionId: session.id,
      importe: session.amount_total ?? 0,
      moneda: session.currency ?? "eur",
    },
  });
}

export async function confirmarKit(
  sessionId: string,
  usuarioId: string,
): Promise<boolean> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return false;
  }
  if (
    session.payment_status !== "paid" ||
    session.metadata?.tipo !== "kit_traspaso" ||
    session.metadata?.usuarioId !== usuarioId
  ) {
    return false;
  }
  await otorgarKitDesdeSesion(session);
  return true;
}
