import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { formatFechaRelativa } from "@/lib/format";
import { UnreadBadge } from "@/components/layout/UnreadBadge";

interface ConversacionListItemProps {
  conversacion: {
    id: string;
    anuncio: { id: string; titulo: string; fotos: string[] };
    interesado: { id: string; nombre: string };
    propietario: { id: string; nombre: string };
    mensajes: { texto: string; fechaHora: Date | string }[];
    fechaUltimaActividad: Date | string;
    noLeidos: number;
  };
  currentUserId: string;
}

// One item in the inbox list. The parent composes many of these; each item
// owns its own bottom hairline so the list "just works" regardless of how
// the parent wraps/paginates it.
export function ConversacionListItem({
  conversacion,
  currentUserId,
}: ConversacionListItemProps) {
  const esPropietario = currentUserId === conversacion.propietario.id;
  const otroParticipante = esPropietario
    ? conversacion.interesado.nombre
    : conversacion.propietario.nombre;
  const ultimoMensaje = conversacion.mensajes[0]?.texto ?? "";
  const foto = conversacion.anuncio.fotos[0];

  return (
    <Link
      href={`/mensajes/${conversacion.id}`}
      className="flex items-start gap-3 border-b border-border py-3 transition-colors hover:bg-muted/50"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {foto ? (
          <Image
            src={foto}
            alt={conversacion.anuncio.titulo}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{otroParticipante}</p>
        <p className="truncate text-sm text-muted-foreground">
          {conversacion.anuncio.titulo}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {ultimoMensaje}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-xs text-muted-foreground">
          {formatFechaRelativa(conversacion.fechaUltimaActividad)}
        </span>
        <UnreadBadge count={conversacion.noLeidos} />
      </div>
    </Link>
  );
}
