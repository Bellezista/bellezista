import { cn } from "@/lib/utils";
import { formatFechaRelativa } from "@/lib/format";

interface MensajeBubbleProps {
  mensaje: {
    texto: string;
    fechaHora: Date | string;
    autor: { nombre: string };
  };
  esPropio: boolean;
}

// A single chat bubble. Own messages float right on the soft-black primary
// surface, the other participant's messages float left on the muted
// surface -- no gold, no colored fills beyond the two neutral tones already
// used everywhere else in the UI.
export function MensajeBubble({ mensaje, esPropio }: MensajeBubbleProps) {
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
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap text-sm">{mensaje.texto}</p>
          <p
            className={cn(
              "mt-1 text-xs",
              esPropio ? "opacity-70" : "text-muted-foreground"
            )}
          >
            {formatFechaRelativa(mensaje.fechaHora)}
          </p>
        </div>
      </div>
    </div>
  );
}
