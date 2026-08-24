import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";
import { TALENTO_PACKS } from "@/lib/talento/precios";

const DIA_MS = 24 * 60 * 60 * 1000;

// Grants the effect of a paid Talento pack Checkout: add unlock credits (Pack
// Inicio) or extend unlimited access (3/6/12-month packs). Idempotent via the
// unique stripe_session_id, so it is safe to call from BOTH the webhook and the
// success-redirect confirmation.
export async function otorgarAccesoDesdeSesion(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const md = session.metadata ?? {};
  const usuarioId = md.usuarioId;
  if (!usuarioId || md.tipo !== "talento_pack") return;

  const pack = TALENTO_PACKS[md.packId ?? ""];
  if (!pack) return;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.talentoPago.create({
        data: {
          stripeSessionId: session.id,
          usuarioId,
          tipo: `pack_${pack.id.toLowerCase()}`,
          creditos: pack.tipo === "creditos" ? (pack.creditos ?? 0) : 0,
          importe: session.amount_total ?? 0,
          moneda: session.currency ?? "eur",
        },
      });

      if (pack.tipo === "creditos") {
        const creditos = pack.creditos ?? 0;
        await tx.talentoCredito.upsert({
          where: { usuarioId },
          create: { usuarioId, saldo: creditos },
          update: { saldo: { increment: creditos } },
        });
      } else {
        // Extend the unlimited window from now (or from the current expiry if
        // still active), so buying/renewing stacks the remaining time.
        const actual = await tx.talentoCredito.findUnique({
          where: { usuarioId },
          select: { accesoIlimitadoHasta: true },
        });
        const ahora = Date.now();
        const base =
          actual?.accesoIlimitadoHasta &&
          actual.accesoIlimitadoHasta.getTime() > ahora
            ? actual.accesoIlimitadoHasta.getTime()
            : ahora;
        const hasta = new Date(base + (pack.meses ?? 0) * 30 * DIA_MS);
        await tx.talentoCredito.upsert({
          where: { usuarioId },
          create: { usuarioId, saldo: 0, accesoIlimitadoHasta: hasta },
          update: { accesoIlimitadoHasta: hasta },
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
