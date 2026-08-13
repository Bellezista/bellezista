import { headers } from "next/headers";

// Absolute base URL of the current request, used to build Stripe redirect URLs.
// Prefers an explicit env override, then the forwarded host (Vercel), so it
// works in local dev and production without hardcoding the domain.
export async function getBaseUrl(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
