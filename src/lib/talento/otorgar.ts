import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";
import { crearNotificacion } from "@/lib/notificaciones/crear";

// Grants the effect of a paid Checkout Session: unlock a CV (individual) or add
// bono credits. Idempotent via the unique stripe_session_id, so it is safe to
// call from BOTH the webhook and the success-redirect confirmation.
export async function otorgarAccesoDesdeSesion(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const md = session.metadata ?? {};
  const usuarioId = md.usuarioId;
  const tipo = md.tipo;
  if (!usuarioId || !tipo) return;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.talentoPago.create({
        data: {
          stripeSessionId: session.id,
          usuarioId,
          tipo,
          cvId: tipo === "individual" ? (md.cvId ?? null) : null,
          creditos: tipo === "bono" ? Number(md.creditos ?? 0) : 0,
          importe: session.amount_total ?? 0,
          moneda: session.currency ?? "eur",
        },
      });

      if (tipo === "individual" && md.cvId) {
        await tx.cvDesbloqueo.upsert({
          where: { usuarioId_cvId: { usuarioId, cvId: md.cvId } },
          create: { usuarioId, cvId: md.cvId },
          update: {},
        });
      } else if (tipo === "bono") {
        const creditos = Number(md.creditos ?? 0);
        await tx.talentoCredito.upsert({
          where: { usuarioId },
          create: { usuarioId, saldo: creditos },
          update: { saldo: { increment: creditos } },
        });
      }
    });
  } catch (e) {
    // Duplicate stripe_session_id -> already processed, treat as success.
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return;
    }
    throw e;
  }

  // Notify the CV owner that a business unlocked their profile (individual only;
  // the bono grants no specific CV yet).
  if (tipo === "individual" && md.cvId) {
    const cv = await prisma.cv.findUnique({
      where: { id: md.cvId },
      select: { usuarioId: true },
    });
    if (cv) {
      await crearNotificacion(cv.usuarioId, {
        tipo: "desbloqueo",
        titulo: "Han desbloqueado tu CV",
        cuerpo: "Un negocio ha accedido a tu perfil completo.",
        url: "/talento/mi-cv",
      });
    }
  }
}

// Confirms a session from the success redirect. Verifies it is paid and belongs
// to this user before granting. Returns true if access is (now) granted.
export async function confirmarSesionCheckout(
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
    session.metadata?.usuarioId !== usuarioId
  ) {
    return false;
  }
  await otorgarAccesoDesdeSesion(session);
  return true;
}
