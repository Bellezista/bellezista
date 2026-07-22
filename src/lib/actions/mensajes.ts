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

// Unread count = messages from the OTHER participant newer than my own
// read-cursor for that conversation (Conversacion.ultimaLectura{Interesado,
// Propietario}) -- a cursor per participant, not a boolean per message, so
// opening a thread marks everything read in one write regardless of how many
// messages are in it.
function miCursorDeLectura(
  conversacion: {
    interesadoId: string;
    ultimaLecturaInteresado: Date | null;
    ultimaLecturaPropietario: Date | null;
  },
  usuarioId: string,
) {
  return conversacion.interesadoId === usuarioId
    ? conversacion.ultimaLecturaInteresado
    : conversacion.ultimaLecturaPropietario;
}

async function contarNoLeidos<
  T extends {
    id: string;
    interesadoId: string;
    ultimaLecturaInteresado: Date | null;
    ultimaLecturaPropietario: Date | null;
  },
>(conversaciones: T[], usuarioId: string) {
  if (conversaciones.length === 0) return new Map<string, number>();

  const mensajesDeOtros = await prisma.mensaje.findMany({
    where: {
      conversacionId: { in: conversaciones.map((c) => c.id) },
      autorId: { not: usuarioId },
    },
    select: { conversacionId: true, fechaHora: true },
  });

  const conteos = new Map<string, number>();
  for (const conversacion of conversaciones) {
    const cursor = miCursorDeLectura(conversacion, usuarioId);
    const noLeidos = mensajesDeOtros.filter(
      (m) => m.conversacionId === conversacion.id && (!cursor || m.fechaHora > cursor),
    ).length;
    conteos.set(conversacion.id, noLeidos);
  }
  return conteos;
}

export async function getConversaciones() {
  const usuarioId = await requireUsuarioId();
  const conversaciones = await prisma.conversacion.findMany({
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

  const noLeidosPorConversacion = await contarNoLeidos(conversaciones, usuarioId);
  return conversaciones.map((conversacion) => ({
    ...conversacion,
    noLeidos: noLeidosPorConversacion.get(conversacion.id) ?? 0,
  }));
}

// Total across every conversation -- the sidebar/mobile-nav badge needs this
// independent of whether the inbox page is even mounted, so it's its own
// lightweight action (no anuncio/participante includes) rather than derived
// from getConversaciones().
export async function getConteoNoLeidos() {
  const usuarioId = await requireUsuarioId();
  const conversaciones = await prisma.conversacion.findMany({
    where: {
      OR: [{ interesadoId: usuarioId }, { propietarioId: usuarioId }],
    },
    select: {
      id: true,
      interesadoId: true,
      ultimaLecturaInteresado: true,
      ultimaLecturaPropietario: true,
    },
  });

  const noLeidosPorConversacion = await contarNoLeidos(conversaciones, usuarioId);
  return [...noLeidosPorConversacion.values()].reduce((total, n) => total + n, 0);
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

// Called when the thread is opened/updated (see ThreadClient) -- advances
// only the calling participant's own cursor, so marking your copy read never
// affects the other participant's unread count.
export async function marcarConversacionLeida(conversacionId: string) {
  const usuarioId = await requireUsuarioId();
  const conversacion = await requireParticipante(conversacionId, usuarioId);
  if (!conversacion) return;

  const esInteresado = conversacion.interesadoId === usuarioId;
  await prisma.conversacion.update({
    where: { id: conversacionId },
    data: esInteresado
      ? { ultimaLecturaInteresado: new Date() }
      : { ultimaLecturaPropietario: new Date() },
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
  if (!conversacion) return { error: "No tienes acceso a esta conversación." };

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
