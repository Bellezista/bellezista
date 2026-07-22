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
    <div className="flex h-[calc(100vh-8rem)] flex-col">
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

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {conversacion.mensajes.map((mensaje) => (
          <MensajeBubble
            key={mensaje.id}
            mensaje={mensaje}
            esPropio={mensaje.autorId === currentUserId}
            leido={
              otroUltimaLectura != null &&
              new Date(mensaje.fechaHora) <= new Date(otroUltimaLectura)
            }
          />
        ))}
        <div ref={finalRef} />
      </div>

      <MensajeComposer conversacionId={conversacionId} />
    </div>
  );
}
