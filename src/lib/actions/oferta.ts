"use server";

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import { OFERTA_PRECIOS, MONEDA_OFERTA } from "@/lib/oferta/precios";
import { generarSlugOferta, normalizarWhatsapp } from "@/lib/oferta/slug";
import { confirmarOfertaDesdeSesion } from "@/lib/oferta/otorgar";
import type { TipoNegocioTraspaso, VigenciaOferta } from "@generated/prisma/enums";

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export interface CrearOfertaInput {
  titulo: string;
  descripcion: string;
  precio: number;
  precioOriginal?: number | null;
  tipoNegocio: TipoNegocioTraspaso;
  foto: string;
  whatsapp: string;
  ciudadProvincia?: string | null;
  vigencia: VigenciaOferta;
}

// Creates a pending offer and a one-off Checkout for the chosen vigencia. The
// offer goes live (ACTIVA) only once payment completes (webhook / redirect).
export async function crearOfertaCheckout(
  input: CrearOfertaInput,
): Promise<{ url?: string; error?: string }> {
  const usuarioId = await getUserId();
  if (!usuarioId) return { error: "Inicia sesión para publicar una oferta." };

  const cfg = OFERTA_PRECIOS[input.vigencia];
  if (!cfg) return { error: "Duración no válida." };

  const titulo = input.titulo.trim();
  const descripcion = input.descripcion.trim();
  const whatsapp = normalizarWhatsapp(input.whatsapp);
  if (!titulo || !descripcion) return { error: "Faltan datos de la oferta." };
  if (!input.foto) return { error: "Añade una foto a la oferta." };
  if (whatsapp.length < 9) return { error: "Introduce un número de WhatsApp válido." };
  if (!Number.isFinite(input.precio) || input.precio < 0) {
    return { error: "Precio no válido." };
  }

  const oferta = await prisma.oferta.create({
    data: {
      slug: generarSlugOferta(titulo),
      titulo,
      descripcion,
      precio: input.precio,
      precioOriginal:
        input.precioOriginal && input.precioOriginal > 0
          ? input.precioOriginal
          : null,
      tipoNegocio: input.tipoNegocio,
      foto: input.foto,
      whatsapp,
      ciudadProvincia: input.ciudadProvincia?.trim() || null,
      vigencia: input.vigencia,
      estado: "PENDIENTE_DE_PAGO",
      propietarioId: usuarioId,
    },
    select: { id: true },
  });

  const base = await getBaseUrl();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: MONEDA_OFERTA,
            product_data: { name: cfg.nombre },
            unit_amount: cfg.importe,
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/mis-ofertas?oferta=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/publicar/oferta?oferta=cancel`,
      client_reference_id: usuarioId,
      metadata: {
        tipo: "oferta",
        ofertaId: oferta.id,
        usuarioId,
        vigencia: input.vigencia,
      },
    });
    return { url: session.url ?? undefined };
  } catch (e) {
    await prisma.oferta.delete({ where: { id: oferta.id } }).catch(() => {});
    const msg = e instanceof Error ? e.message : "error";
    return { error: `No se pudo iniciar el pago: ${msg}` };
  }
}

export async function confirmarOferta(sessionId: string): Promise<boolean> {
  return confirmarOfertaDesdeSesion(sessionId);
}

export async function getMisOfertas() {
  const usuarioId = await getUserId();
  if (!usuarioId) return [];
  return prisma.oferta.findMany({
    where: { propietarioId: usuarioId },
    orderBy: { creadoEn: "desc" },
  });
}
