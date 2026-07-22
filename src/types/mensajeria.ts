// Shared messaging types, mirroring the exact Prisma `include` shapes in
// src/lib/actions/mensajes.ts. Kept in a plain module (no "use server"/"use
// client" directive) for the same reason as src/types/anuncio.ts -- see that
// file's comment.
import type { Conversacion, Mensaje, Usuario } from "@generated/prisma/client";

type AnuncioResumen = { id: string; titulo: string; fotos: string[] };
type ParticipanteResumen = { id: string; nombre: string };

export type ConversacionConUltimoMensaje = Conversacion & {
  anuncio: AnuncioResumen;
  interesado: ParticipanteResumen;
  propietario: ParticipanteResumen;
  // getConversaciones() takes(1) without a `select`, so it's the full row.
  mensajes: Mensaje[];
  noLeidos: number;
};

export type ConversacionConMensajes = Conversacion & {
  anuncio: AnuncioResumen;
  interesado: ParticipanteResumen;
  propietario: ParticipanteResumen;
  mensajes: (Mensaje & { autor: Usuario })[];
};
