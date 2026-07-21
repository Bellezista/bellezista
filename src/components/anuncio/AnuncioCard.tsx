import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { AnuncioSerializado } from "@/types/anuncio";
import { maquinariaAdapter } from "@/lib/anuncio/subtype-adapters";
import { formatPrecio } from "@/lib/format";
import { EstadoTexto } from "@/components/anuncio/EstadoTexto";

interface AnuncioCardProps {
  anuncio: AnuncioSerializado;
}

// Reusable catalog card. Kept subtype-agnostic on purpose: it only ever
// touches Maquinaria through maquinariaAdapter.getAtributosCard, so adding
// Traspasos/Talent/Oferta subtypes in Fase 2 means a new adapter, not a
// change here (see src/lib/anuncio/subtype-adapters.ts).
export function AnuncioCard({ anuncio }: AnuncioCardProps) {
  const portada = anuncio.fotos[0];
  const atributos = anuncio.maquinaria
    ? maquinariaAdapter.getAtributosCard(anuncio.maquinaria).slice(0, 2)
    : [];

  return (
    <Link
      href={`/anuncios/${anuncio.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {portada ? (
          <Image
            src={portada}
            alt={anuncio.titulo}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">Sin fotos</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        <h3 className="line-clamp-2 font-serif text-base font-semibold text-foreground">
          {anuncio.titulo}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{anuncio.ciudadProvincia}</span>
        </div>

        {atributos.length > 0 && (
          <p className="truncate text-sm text-muted-foreground">
            {atributos.map((atributo) => atributo.value).join(" · ")}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-foreground">
            {formatPrecio(anuncio.precio.toString())}
          </span>
          <EstadoTexto estado={anuncio.estado} />
        </div>
      </div>
    </Link>
  );
}
