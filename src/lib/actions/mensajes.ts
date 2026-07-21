"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { mensajeSchema } from "@/lib/validation/mensajeSchema";

async function requireUsuarioId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

export async function getConversaciones() {
  const usuarioId = await requireUsuarioId();
  return prisma.conversacion.findMany({
    where: {
      OR: [{ interesadoId: usuarioId }, { propietarioId: usuarioId }],
    },
    include: {
      anuncio: { select: { id: true, titulo: true, fotos: true } },
      interesado: { select: { id: true, nombre: true } },
      propietario: { select: { id: true, nombre: true } },
      mensajes: { orderBy: { fechaHora: "desc" }, take: 1 },
    },
    orderBy: { fechaUltimaActividad: "desc" },
  });
}

// Every read/write here re-checks that the calling user is actually a
// participant of the conversation -- these are POST/reachable independent of
// the UI, never trust a client-supplied conversacionId alone (see the plan's
// Next.js 16 addendum on Server Function security).
async function requireParticipante(conversacionId: string, usuarioId: string) {
  const conversacion = await prisma.conversacion.findUnique({
    where: { id: conversacionId },
  });
  if (
    !conversacion ||
    (conversacion.interesadoId !== usuarioId &&
      conversacion.propietarioId !== usuarioId)
  ) {
    return null;
  }
  return conversacion;
}

export async function getConversacion(conversacionId: string) {
  const usuarioId = await requireUsuarioId();
  const conversacion = await requireParticipante(conversacionId, usuarioId);
  if (!conversacion) return null;

  return prisma.conversacion.findUnique({
    where: { id: conversacionId },
    include: {
      anuncio: { select: { id: true, titulo: true, fotos: true } },
      interesado: { select: { id: true, nombre: true } },
      propietario: { select: { id: true, nombre: true } },
      mensajes: { orderBy: { fechaHora: "asc" }, include: { autor: true } },
    },
  });
}

// Called from a plain <form action={iniciarConversacion.bind(null, anuncioId)}>
// (see FichaContactoCard) so redirect() propagates correctly -- its return
// type must stay `Promise<void>` (every path either redirects or falls
// through to the final redirect below). The two guard clauses below are
// defense-in-depth against a hand-crafted request; the UI itself never
// renders this form for your own listing, so bouncing back to the ficha
// silently is the right behavior, not a real user-facing error state.
export async function iniciarConversacion(anuncioId: string) {
  const usuarioId = await requireUsuarioId();
  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { propietarioId: true },
  });
  if (!anuncio || anuncio.propietarioId === usuarioId) {
    redirect(`/anuncios/${anuncioId}`);
  }

  const conversacion = await prisma.conversacion.upsert({
    where: {
      anuncioId_interesadoId: { anuncioId, interesadoId: usuarioId },
    },
    create: {
      anuncioId,
      interesadoId: usuarioId,
      propietarioId: anuncio.propietarioId,
    },
    update: {},
  });

  redirect(`/mensajes/${conversacion.id}`);
}

export async function enviarMensaje(conversacionId: string, input: unknown) {
  const usuarioId = await requireUsuarioId();
  const conversacion = await requireParticipante(conversacionId, usuarioId);
  if (!conversacion) return { error: "No tenés acceso a esta conversación." };

  const parsed = mensajeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Mensaje inválido." };
  }

  await prisma.$transaction([
    prisma.mensaje.create({
      data: {
        conversacionId,
        autorId: usuarioId,
        texto: parsed.data.texto,
      },
    }),
    prisma.conversacion.update({
      where: { id: conversacionId },
      data: { fechaUltimaActividad: new Date() },
    }),
  ]);

  revalidatePath(`/mensajes/${conversacionId}`);
  revalidatePath("/mensajes");
  refresh();
}
