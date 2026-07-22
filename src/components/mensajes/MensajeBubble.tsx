import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFechaRelativa } from "@/lib/format";

interface MensajeBubbleProps {
  mensaje: {
    texto: string;
    fechaHora: Date | string;
    autor: { nombre: string };
  };
  esPropio: boolean;
  // Only meaningful when esPropio -- whether the OTHER participant's read
  // cursor is past this message's timestamp. Undefined for the other
  // participant's own messages, where no receipt is ever shown (same as
  // Telegram/WhatsApp -- you only see the read state of what you sent).
  leido?: boolean;
}

// A single chat bubble. Own messages float right on the soft-black
// (foreground) surface, the other participant's messages float left on the
// muted surface -- no gold, no colored fills. Deliberately NOT bg-primary:
// since Manual 01 makes --primary the solid gold button/CTA color, using it
// here would turn every one of the user's own messages into a gold bubble.
export function MensajeBubble({ mensaje, esPropio, leido }: MensajeBubbleProps) {
  return (
    <div className={cn("flex w-full", esPropio ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[75%] flex-col",
          esPropio ? "items-end" : "items-start"
        )}
      >
        <span className="mb-1 px-1 text-xs text-muted-foreground">
          {esPropio ? "Vos" : mensaje.autor.nombre}
        </span>
        <div
          className={cn(
            "rounded-lg p-3",
            esPropio
              ? "bg-foreground text-background"
              : "bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap text-sm">{mensaje.texto}</p>
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs",
              esPropio ? "opacity-70" : "text-muted-foreground"
            )}
          >
            {formatFechaRelativa(mensaje.fechaHora)}
            {esPropio &&
              (leido ? (
                <CheckCheck className="size-3.5" aria-label="Leído" />
              ) : (
                <Check className="size-3.5" aria-label="Enviado" />
              ))}
          </p>
        </div>
      </div>
    </div>
  );
}
