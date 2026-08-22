"use server";

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import {
  getOrCreateConnectAccount,
  refreshEstadoConnect,
  type EstadoConnect,
} from "@/lib/stripe/connect";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? undefined } : null;
}

// Starts (or resumes) Stripe Connect onboarding and returns the hosted link.
export async function crearEnlaceOnboarding(): Promise<{
  url?: string;
  error?: string;
}> {
  const user = await getUser();
  if (!user) return { error: "Inicia sesión." };

  try {
    const accountId = await getOrCreateConnectAccount(user.id, user.email);
    const base = await getBaseUrl();
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${base}/perfil?cobros=refresh`,
      return_url: `${base}/perfil?cobros=ok`,
      type: "account_onboarding",
    });
    return { url: link.url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return { error: `No se pudo iniciar la activación de cobros: ${msg}` };
  }
}

// Live Connect status (also refreshes the cached cobrosActivos flag).
export async function getEstadoCobros(): Promise<EstadoConnect | null> {
  const user = await getUser();
  if (!user) return null;
  try {
    return await refreshEstadoConnect(user.id);
  } catch {
    return { tieneCuenta: false, cobrosActivos: false, datosPendientes: false };
  }
}

// Express dashboard login link so an onboarded seller can see their payouts.
export async function crearEnlacePanelCobros(): Promise<{
  url?: string;
  error?: string;
}> {
  const user = await getUser();
  if (!user) return { error: "Inicia sesión." };
  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { stripeConnectId: true },
  });
  if (!usuario?.stripeConnectId) {
    return { error: "Todavía no has activado los cobros." };
  }
  try {
    const link = await stripe.accounts.createLoginLink(usuario.stripeConnectId);
    return { url: link.url };
  } catch {
    return { error: "El panel de cobros no está disponible todavía." };
  }
}
