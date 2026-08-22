"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrecio } from "@/lib/format";
import type { EstadoOferta } from "@generated/prisma/enums";

export interface OfertaView {
  id: string;
  slug: string;
  titulo: string;
  estado: EstadoOferta;
  precio: string;
  foto: string;
  fechaCaducidad: string | null;
}

const ESTADO: Record<EstadoOferta, { label: string; clase: string }> = {
  PENDIENTE_DE_PAGO: {
    label: "Pendiente de pago",
    clase: "bg-muted text-muted-foreground",
  },
  ACTIVA: { label: "Activa", clase: "bg-emerald-100 text-emerald-800" },
  CADUCADA: { label: "Caducada", clase: "bg-muted text-muted-foreground" },
};

function OfertaRow({ oferta }: { oferta: OfertaView }) {
  const [copiado, setCopiado] = useState(false);
  const url =
    typeof window !== "undefined" ? `${window.location.origin}/o/${oferta.slug}` : "";
  const activa = oferta.estado === "ACTIVA";
  const caduca = oferta.fechaCaducidad
    ? new Date(oferta.fechaCaducidad).toLocaleDateString("es-ES")
    : null;

  function copiar() {
    navigator.clipboard?.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {oferta.foto ? (
          <Image src={oferta.foto} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{oferta.titulo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
              ESTADO[oferta.estado].clase,
            )}
          >
            {ESTADO[oferta.estado].label}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatPrecio(oferta.precio)}
          </span>
          {activa && caduca && (
            <span className="text-xs text-muted-foreground">
              · válida hasta {caduca}
            </span>
          )}
        </div>
      </div>

      {activa && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={copiar}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            {copiado ? (
              <>
                <Check className="size-4 text-gold" aria-hidden="true" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                Copiar enlace
              </>
            )}
          </button>
          <a
            href={`/o/${oferta.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Ver
          </a>
        </div>
      )}
    </div>
  );
}

export function MisOfertasList({ ofertas }: { ofertas: OfertaView[] }) {
  return (
    <div className="space-y-3">
      {ofertas.map((o) => (
        <OfertaRow key={o.id} oferta={o} />
      ))}
    </div>
  );
}
