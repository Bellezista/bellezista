"use client";

import { useConversaciones } from "@/hooks/useConversaciones";
import { ConversacionListItem } from "@/components/mensajes/ConversacionListItem";
import type { ConversacionConUltimoMensaje } from "@/types/mensajeria";

interface InboxClientProps {
  currentUserId: string;
  initialData: ConversacionConUltimoMensaje[];
}

export function InboxClient({ currentUserId, initialData }: InboxClientProps) {
  const { data } = useConversaciones(initialData);
  const conversaciones = data ?? [];

  if (conversaciones.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Todavía no tienes conversaciones.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {conversaciones.map((conversacion) => (
        <ConversacionListItem
          key={conversacion.id}
          conversacion={conversacion}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
