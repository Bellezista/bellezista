"use client";

import { useAnuncios } from "@/hooks/useAnuncios";
import { AnuncioGrid } from "@/components/anuncio/AnuncioGrid";
import type { CatalogoFiltros, AnuncioSerializado } from "@/types/anuncio";

interface CatalogoClientProps {
  filtros: CatalogoFiltros;
  initialData: AnuncioSerializado[];
}

// The Server Component page does the first paint for whatever filters are in
// the URL on load; this client island takes over so later filter-chip
// changes refetch instantly without a full navigation (see the plan's
// data-fetching strategy).
export function CatalogoClient({ filtros, initialData }: CatalogoClientProps) {
  const { data } = useAnuncios(filtros, initialData);
  return <AnuncioGrid anuncios={data ?? []} />;
}
