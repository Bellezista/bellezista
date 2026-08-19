import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";
import { PLANES_PRO, FREE_LIMIT_TRASPASOS } from "@/lib/traspaso/planes";
import type { PlanPro } from "@generated/prisma/enums";

// Maps Stripe subscription status to our estado.
function estadoDe(status: Stripe.Subscription.Status): string {
  if (status === "active" || status === "trialing") return "activa";
  if (status === "past_due" || status === "unpaid") return "impagada";
  if (status === "canceled" || status === "incomplete_expired") return "cancelada";
  return "incompleta";
}

// Reuses or creates the Stripe customer for a user and stores its id.
export async function getOrCreateCustomer(
  usuarioId: string,
  email: string | undefined,
): Promise<string> {
  const existente = await prisma.suscripcionPro.findUnique({
    where: { usuarioId },
    select: { stripeCustomerId: true },
  });
  if (existente?.stripeCustomerId) return existente.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { usuarioId },
  });
  await prisma.suscripcionPro.upsert({
    where: { usuarioId },
    create: {
      usuarioId,
      plan: "BASICO",
      estado: "incompleta",
      stripeCustomerId: customer.id,
    },
    update: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

// Keeps the local SuscripcionPro in sync with a Stripe subscription object.
// Called from the webhook (created/updated/deleted) and the success redirect.
export async function sincronizarSuscripcion(
  subscription: Stripe.Subscription,
): Promise<void> {
  const usuarioId = subscription.metadata?.usuarioId;
  const plan = subscription.metadata?.plan as PlanPro | undefined;
  if (!usuarioId || !plan) return;

  const periodEnd = subscription.items.data[0]?.current_period_end;

  await prisma.suscripcionPro.upsert({
    where: { usuarioId },
    create: {
      usuarioId,
      plan,
      estado: estadoDe(subscription.status),
      stripeCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      stripeSubscriptionId: subscription.id,
      vigenteHasta: periodEnd ? new Date(periodEnd * 1000) : null,
    },
    update: {
      plan,
      estado: estadoDe(subscription.status),
      stripeSubscriptionId: subscription.id,
      vigenteHasta: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}

// Active-listing limit for a user: their plan's limit if the subscription is
// active, otherwise the free tier. null = unlimited.
export async function limiteTraspasosDeUsuario(
  usuarioId: string,
): Promise<number | null> {
  const sub = await prisma.suscripcionPro.findUnique({
    where: { usuarioId },
    select: { plan: true, estado: true },
  });
  if (!sub || sub.estado !== "activa") return FREE_LIMIT_TRASPASOS;
  return PLANES_PRO[sub.plan].limite;
}
