import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";
import { OFERTA_PRECIOS } from "@/lib/oferta/precios";
import type { VigenciaOferta } from "@generated/prisma/enums";

const DIA_MS = 24 * 60 * 60 * 1000;

// Activates a paid offer from its Checkout session: sets it ACTIVA and computes
// the expiry from the chosen vigencia. Idempotent via the unique
// stripe_session_id + the state guard.
export async function otorgarOfertaDesdeSesion(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const md = session.metadata ?? {};
  if (md.tipo !== "oferta" || !md.ofertaId || !md.vigencia) return;

  const vigencia = md.vigencia as VigenciaOferta;
  const cfg = OFERTA_PRECIOS[vigencia];
  if (!cfg) return;

  const oferta = await prisma.oferta.findUnique({
    where: { id: md.ofertaId },
    select: { id: true, estado: true },
  });
  if (!oferta || oferta.estado === "ACTIVA") return;

  await prisma.oferta.update({
    where: { id: md.ofertaId },
    data: {
      estado: "ACTIVA",
      fechaCaducidad: new Date(Date.now() + cfg.dias * DIA_MS),
      stripeSessionId: session.id,
    },
  });
}

// Confirms an offer from the publish success redirect (belt-and-suspenders vs
// the webhook). Returns true if it's now active.
export async function confirmarOfertaDesdeSesion(
  sessionId: string,
): Promise<boolean> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return false;
  }
  if (session.payment_status !== "paid" || session.metadata?.tipo !== "oferta") {
    return false;
  }
  await otorgarOfertaDesdeSesion(session);
  return true;
}

// Marks expired offers CADUCADA (called by the daily cron). The landing already
// hides expired offers at render time; this keeps the stored state tidy.
export async function caducarOfertasVencidas(): Promise<{ caducadas: number }> {
  const res = await prisma.oferta.updateMany({
    where: { estado: "ACTIVA", fechaCaducidad: { lt: new Date() } },
    data: { estado: "CADUCADA" },
  });
  return { caducadas: res.count };
}
