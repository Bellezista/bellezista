import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";

const DIA_MS = 24 * 60 * 60 * 1000;

// Grants a paid "destacado": extends the listing's destacadoHasta by the paid
// number of days (from now, or from the current expiry if still active).
// Idempotent via the unique stripe_session_id in pago_anuncio.
export async function otorgarDestacadoDesdeSesion(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const md = session.metadata ?? {};
  if (md.tipo !== "destacado" || !md.anuncioId || !md.usuarioId) return;
  const dias = Number(md.dias ?? 0);
  if (!dias) return;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pagoAnuncio.create({
        data: {
          stripeSessionId: session.id,
          anuncioId: md.anuncioId!,
          usuarioId: md.usuarioId!,
          tipo: "destacado",
          importe: session.amount_total ?? 0,
          moneda: session.currency ?? "eur",
          dias,
        },
      });
      const anuncio = await tx.anuncio.findUnique({
        where: { id: md.anuncioId! },
        select: { destacadoHasta: true },
      });
      const ahora = Date.now();
      const base =
        anuncio?.destacadoHasta && anuncio.destacadoHasta.getTime() > ahora
          ? anuncio.destacadoHasta.getTime()
          : ahora;
      await tx.anuncio.update({
        where: { id: md.anuncioId! },
        data: { destacadoHasta: new Date(base + dias * DIA_MS) },
      });
    });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return; // already processed
    }
    throw e;
  }
}

// Confirms a destacado session from the success redirect (grants even before
// the webhook lands). Returns true if it applied.
export async function confirmarDestacado(
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
    session.metadata?.tipo !== "destacado" ||
    session.metadata?.usuarioId !== usuarioId
  ) {
    return false;
  }
  await otorgarDestacadoDesdeSesion(session);
  return true;
}
