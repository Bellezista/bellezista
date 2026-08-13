import "server-only";
import Stripe from "stripe";

// Single Stripe client for the server. Reads the secret key from the env, so
// swapping Stripe test keys for the production keys later is just a config
// change -- no code touched (see .env.example for the vars).
const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // Thrown lazily on first use rather than at import, so builds without the key
  // set (e.g. CI) don't fail; any request that needs Stripe will surface it.
  console.warn("STRIPE_SECRET_KEY no está definida: los pagos no funcionarán.");
}

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder");

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
