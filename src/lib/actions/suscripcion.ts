"use server";

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import { PLANES_PRO, MONEDA_PLAN } from "@/lib/traspaso/planes";
import {
  getOrCreateCustomer,
  sincronizarSuscripcion,
} from "@/lib/traspaso/suscripcion";
import type { PlanPro } from "@generated/prisma/enums";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? undefined } : null;
}

export async function crearCheckoutSuscripcion(
  plan: PlanPro,
): Promise<{ url?: string; error?: string }> {
  const user = await getUser();
  if (!user) return { error: "Inicia sesión para suscribirte." };
  const p = PLANES_PRO[plan];
  if (!p) return { error: "Plan no válido." };

  const customer = await getOrCreateCustomer(user.id, user.email);
  const base = await getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [
      {
        price_data: {
          currency: MONEDA_PLAN,
          product_data: { name: `Plan ${p.nombre} · Bellezista` },
          unit_amount: p.importe,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    subscription_data: { metadata: { usuarioId: user.id, plan } },
    success_url: `${base}/perfil?suscripcion=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/planes-profesionales?suscripcion=cancel`,
    metadata: { tipo: "suscripcion", usuarioId: user.id, plan },
  });

  return { url: session.url ?? undefined };
}

export async function getMiSuscripcion() {
  const user = await getUser();
  if (!user) return null;
  return prisma.suscripcionPro.findUnique({ where: { usuarioId: user.id } });
}

export async function crearPortalSuscripcion(): Promise<{
  url?: string;
  error?: string;
}> {
  const user = await getUser();
  if (!user) return { error: "Inicia sesión." };
  const sub = await prisma.suscripcionPro.findUnique({
    where: { usuarioId: user.id },
    select: { stripeCustomerId: true },
  });
  if (!sub?.stripeCustomerId) {
    return { error: "No tienes una suscripción todavía." };
  }
  const base = await getBaseUrl();
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${base}/perfil`,
    });
    return { url: portal.url };
  } catch {
    return {
      error:
        "El portal de gestión no está disponible. Activa el Customer Portal en Stripe.",
    };
  }
}

// Confirms a subscription from the success redirect (belt-and-suspenders vs the
// webhook), keeping the local record in sync right away.
export async function confirmarSuscripcion(sessionId: string): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.usuarioId !== user.id || !session.subscription) {
    return false;
  }
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
  const sub = await stripe.subscriptions.retrieve(subId);
  await sincronizarSuscripcion(sub);
  return true;
}
