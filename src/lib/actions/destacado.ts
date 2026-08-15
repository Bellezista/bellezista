"use server";

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import {
  DESTACADO_PRECIOS,
  MONEDA_DESTACADO,
} from "@/lib/anuncio/destacado-precios";

// Stripe Checkout to feature ("destacar") one of the owner's listings. Price and
// duration depend on the listing type. The actual destacado is granted by the
// webhook / success-redirect confirmation.
export async function crearCheckoutDestacado(
  anuncioId: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión." };

  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { id: true, tipo: true, propietarioId: true },
  });
  if (!anuncio) return { error: "El anuncio no existe." };
  if (anuncio.propietarioId !== user.id) return { error: "No es tu anuncio." };

  const precio = DESTACADO_PRECIOS[anuncio.tipo];
  if (!precio) return { error: "Este tipo de anuncio no admite destacado." };

  const base = await getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: MONEDA_DESTACADO,
          product_data: { name: precio.nombre },
          unit_amount: precio.importe,
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/mis-anuncios?destacado=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/mis-anuncios?destacado=cancel`,
    client_reference_id: user.id,
    metadata: {
      tipo: "destacado",
      anuncioId,
      usuarioId: user.id,
      dias: String(precio.dias),
    },
  });

  return { url: session.url ?? undefined };
}
