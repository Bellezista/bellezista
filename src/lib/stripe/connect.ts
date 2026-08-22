import "server-only";
import { prisma } from "@/lib/prisma/client";
import { stripe } from "@/lib/stripe/server";

// Stripe Connect (Express) helpers for sellers receiving payouts in the
// commission-with-retention flow. The account is created lazily the first time a
// seller starts onboarding; `cobrosActivos` mirrors Stripe's payouts_enabled so
// the buy flow can gate on it without an API call on every listing view.

// Returns the user's Connect account id, creating an Express account if needed.
export async function getOrCreateConnectAccount(
  usuarioId: string,
  email?: string,
): Promise<string> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { stripeConnectId: true },
  });
  if (usuario?.stripeConnectId) return usuario.stripeConnectId;

  const account = await stripe.accounts.create({
    type: "express",
    country: "ES",
    email,
    capabilities: { transfers: { requested: true } },
    business_type: "individual",
    metadata: { usuarioId },
  });
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { stripeConnectId: account.id },
  });
  return account.id;
}

export interface EstadoConnect {
  tieneCuenta: boolean;
  cobrosActivos: boolean; // payouts_enabled && charges_enabled
  datosPendientes: boolean; // onboarding started but not finished
}

// Reads the live account status from Stripe and refreshes the cached flag.
export async function refreshEstadoConnect(
  usuarioId: string,
): Promise<EstadoConnect> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { stripeConnectId: true },
  });
  if (!usuario?.stripeConnectId) {
    return { tieneCuenta: false, cobrosActivos: false, datosPendientes: false };
  }

  const account = await stripe.accounts.retrieve(usuario.stripeConnectId);
  const cobrosActivos = Boolean(account.payouts_enabled && account.charges_enabled);
  const datosPendientes = !cobrosActivos && Boolean(account.details_submitted);

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { cobrosActivos },
  });

  return { tieneCuenta: true, cobrosActivos, datosPendientes };
}

// Keeps the cached flag in sync from the account.updated webhook.
export async function sincronizarCuentaConnect(account: {
  id: string;
  payouts_enabled?: boolean | null;
  charges_enabled?: boolean | null;
}): Promise<void> {
  const cobrosActivos = Boolean(account.payouts_enabled && account.charges_enabled);
  await prisma.usuario.updateMany({
    where: { stripeConnectId: account.id },
    data: { cobrosActivos },
  });
}
