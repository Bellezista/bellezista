import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/server";
import { otorgarAccesoDesdeSesion } from "@/lib/talento/otorgar";
import { otorgarDestacadoDesdeSesion } from "@/lib/anuncio/destacado";

// Stripe webhook for Talento payments. Grants the unlock (individual) or adds
// bono credits once a Checkout Session is paid. The raw body is required for
// signature verification, so we read request.text() and never parse it first.
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      // Route by the payment type set in the Checkout metadata.
      if (session.metadata?.tipo === "destacado") {
        await otorgarDestacadoDesdeSesion(session);
      } else {
        await otorgarAccesoDesdeSesion(session); // Talento (individual/bono)
      }
    }
  }

  return NextResponse.json({ received: true });
}
