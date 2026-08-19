import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/server";
import { otorgarAccesoDesdeSesion } from "@/lib/talento/otorgar";
import { otorgarDestacadoDesdeSesion } from "@/lib/anuncio/destacado";
import { otorgarKitDesdeSesion } from "@/lib/traspaso/kit-otorgar";
import { sincronizarSuscripcion } from "@/lib/traspaso/suscripcion";

// Stripe webhook. Grants one-off purchases (Talento unlock/bono, destacado, Kit
// Traspaso) on payment, and keeps professional subscriptions in sync. The raw
// body is required for signature verification, so we read request.text() first.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Firma no válida." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    return NextResponse.json(
      { error: `Webhook inválido: ${msg}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tipo = session.metadata?.tipo;
      if (tipo === "suscripcion") {
        // Subscription checkout: sync the created subscription.
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await sincronizarSuscripcion(sub);
        }
      } else if (session.payment_status === "paid") {
        if (tipo === "destacado") await otorgarDestacadoDesdeSesion(session);
        else if (tipo === "kit_traspaso") await otorgarKitDesdeSesion(session);
        else await otorgarAccesoDesdeSesion(session); // Talento (individual/bono)
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await sincronizarSuscripcion(event.data.object as Stripe.Subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
