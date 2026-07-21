"use client";

import Image from "next/image";
import { useMensajes } from "@/hooks/useMensajes";
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

  if (!conversacion) return null;

  const foto = conversacion.anuncio.fotos[0];

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
          />
        ))}
      </div>

      <MensajeComposer conversacionId={conversacionId} />
    </div>
  );
}
