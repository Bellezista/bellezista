import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Wrench } from "lucide-react";
import type { AnuncioSerializado } from "@/types/anuncio";
import { maquinariaAdapter } from "@/lib/anuncio/subtype-adapters";
import { CATEGORIA_MAQUINARIA_LABEL } from "@/lib/anuncio/labels";
import { formatPrecio } from "@/lib/format";
import { EstadoTexto } from "@/components/anuncio/EstadoTexto";

interface AnuncioCardProps {
  anuncio: AnuncioSerializado;
  // Above-the-fold cards (the first row) opt in to eager loading + preload so
  // the first image isn't lazy-loaded as the LCP element. Set by AnuncioGrid.
  priority?: boolean;
}

// Reusable catalog card. Kept subtype-agnostic on purpose: it only ever
// touches Maquinaria through maquinariaAdapter.getAtributosCard, so adding
// Traspasos/Talent/Oferta subtypes in Fase 2 means a new adapter, not a
// change here (see src/lib/anuncio/subtype-adapters.ts).
export function AnuncioCard({ anuncio, priority = false }: AnuncioCardProps) {
  const portada = anuncio.fotos[0];
  const atributos = anuncio.maquinaria
    ? maquinariaAdapter.getAtributosCard(anuncio.maquinaria).slice(0, 2)
    : [];

  return (
    <Link
      href={`/anuncios/${anuncio.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {portada ? (
          <Image
            src={portada}
            alt={anuncio.titulo}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center gap-2 text-muted-foreground">
            <Wrench className="size-4" aria-hidden="true" />
            <span className="text-sm">Sin fotos</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-5">
        {anuncio.maquinaria && (
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            {CATEGORIA_MAQUINARIA_LABEL[anuncio.maquinaria.categoria]}
          </span>
        )}

        <h3 className="line-clamp-2 font-serif text-lg leading-snug text-foreground">
          {anuncio.titulo}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{anuncio.ciudadProvincia}</span>
          {atributos[0] && (
            <>
              <span aria-hidden="true" className="text-border">
                &middot;
              </span>
              <span className="truncate">{atributos[0].value}</span>
            </>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-border pt-3">
          <span className="font-serif text-xl text-gold">
            {formatPrecio(anuncio.precio.toString())}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            <EstadoTexto estado={anuncio.estado} />
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
