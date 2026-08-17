"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getBaseUrl } from "@/lib/site";
import { KIT_TRASPASO } from "@/lib/traspaso/kit";

async function getUsuarioId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Creates a pending Kit Traspaso and its Stripe Checkout Session. On success the
// buyer lands on the details form for that kit.
export async function crearCheckoutKit(): Promise<{
  url?: string;
  error?: string;
}> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "Inicia sesión para comprar el Kit." };

  const kit = await prisma.kitTraspaso.create({
    data: { usuarioId, importe: KIT_TRASPASO.importe, moneda: KIT_TRASPASO.moneda },
  });

  const base = await getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: KIT_TRASPASO.moneda,
          product_data: { name: KIT_TRASPASO.nombre },
          unit_amount: KIT_TRASPASO.importe,
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/kit-traspaso/${kit.id}?pago=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/kit-traspaso?pago=cancel`,
    client_reference_id: usuarioId,
    metadata: { tipo: "kit_traspaso", kitId: kit.id, usuarioId },
  });

  return { url: session.url ?? undefined };
}

export type DatosKit = {
  negocio: string;
  cedente: string;
  cesionario: string;
  precioYPago: string;
  reservaYCuenta: string;
  fechaFirma: string;
  alquiler: string;
  notas?: string;
};

// Saves the details the seller submits after paying, for SoluciónOK to draft the
// documents. Only the owner of a paid kit can submit.
export async function guardarDatosKit(
  kitId: string,
  datos: DatosKit,
  fotos: string[],
): Promise<{ ok?: boolean; error?: string }> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "Inicia sesión." };

  const kit = await prisma.kitTraspaso.findUnique({
    where: { id: kitId },
    select: { usuarioId: true, estado: true },
  });
  if (!kit || kit.usuarioId !== usuarioId) return { error: "Kit no encontrado." };
  if (kit.estado === "pendiente_pago") {
    return { error: "El pago aún no se ha confirmado." };
  }

  await prisma.kitTraspaso.update({
    where: { id: kitId },
    data: { datos, fotos, estado: "datos_enviados" },
  });

  revalidatePath(`/kit-traspaso/${kitId}`);
  return { ok: true };
}
