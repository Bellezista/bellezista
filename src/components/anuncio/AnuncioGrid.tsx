import { SearchX } from "lucide-react";
import type { AnuncioSerializado } from "@/types/anuncio";
import { AnuncioCard } from "@/components/anuncio/AnuncioCard";

interface AnuncioGridProps {
  anuncios: AnuncioSerializado[];
}

export function AnuncioGrid({ anuncios }: AnuncioGridProps) {
  if (anuncios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          No se encontraron anuncios con estos filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {anuncios.map((anuncio) => (
        <AnuncioCard key={anuncio.id} anuncio={anuncio} />
      ))}
    </div>
  );
}
