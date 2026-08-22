"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useMensajes } from "@/hooks/useMensajes";
import { useMarcarLeida } from "@/hooks/useMarcarLeida";
import { MensajeBubble } from "@/components/mensajes/MensajeBubble";
import { MensajeComposer } from "@/components/mensajes/MensajeComposer";
import type { ConversacionConMensajes } from "@/types/mensajeria";

interface ThreadClientProps {
  conversacionId: string;
  currentUserId: string;
  initialData: ConversacionConMensajes | null;
}

export function ThreadClient({
  conversacionId,
  currentUserId,
  initialData,
}: ThreadClientProps) {
  const { data: conversacion } = useMensajes(conversacionId, initialData);
  const marcarLeida = useMarcarLeida();
  const finalRef = useRef<HTMLDivElement>(null);
  const cantidadMensajes = conversacion?.mensajes.length ?? 0;

  // Marks read on open AND every time the message count changes while this
  // thread stays mounted -- covers both "just opened it" and "a new message
  // arrived via polling while I'm already looking at it".
  useEffect(() => {
    if (cantidadMensajes > 0) marcarLeida.mutate(conversacionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversacionId, cantidadMensajes]);

  // Same dependency covers both directions the user asked for: scrolls down
  // when I send a message (my own send grows the array) and scrolls down
  // when the other participant's message arrives while I'm in this window.
  useEffect(() => {
    finalRef.current?.scrollIntoView({ block: "end" });
  }, [cantidadMensajes]);

  if (!conversacion) return null;

  const foto = conversacion.anuncio.fotos[0];
  // The OTHER participant's cursor, not mine -- read receipts on MY messages
  // reflect when THEY last opened this thread.
  const otroUltimaLectura =
    currentUserId === conversacion.interesadoId
      ? conversacion.ultimaLecturaPropietario
      : conversacion.ultimaLecturaInteresado;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {foto && (
            <Image
              src={foto}
              alt={conversacion.anuncio.titulo}
              fill
              sizes="48px"
              className="object-cover"
            />
          )}
        </div>
        <p className="font-medium text-foreground">
          {conversacion.anuncio.titulo}
        </p>
      </div>

      {/* Messages fill a comfortable panel height and anchor to the bottom, so
          the composer sits in the lower-middle (near the last message), not
          stranded at the very bottom nor floating at the top. */}
      <div className="flex h-[52vh] flex-col justify-end gap-3 overflow-y-auto">
        {cantidadMensajes === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay mensajes. Escribe el primero para contactar con el
            propietario.
          </p>
        ) : (
          conversacion.mensajes.map((mensaje) => (
            <MensajeBubble
              key={mensaje.id}
              mensaje={mensaje}
              esPropio={mensaje.autorId === currentUserId}
              leido={
                otroUltimaLectura != null &&
                new Date(mensaje.fechaHora) <= new Date(otroUltimaLectura)
              }
            />
          ))
        )}
        <div ref={finalRef} />
      </div>

      <MensajeComposer conversacionId={conversacionId} />
    </div>
  );
}
