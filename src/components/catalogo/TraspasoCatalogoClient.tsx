"use client";

import { useAnunciosTraspaso } from "@/hooks/useAnunciosTraspaso";
import { AnuncioGrid } from "@/components/anuncio/AnuncioGrid";
import type { CatalogoFiltros, AnuncioSerializado } from "@/types/anuncio";

interface TraspasoCatalogoClientProps {
  filtros: CatalogoFiltros;
  initialData: AnuncioSerializado[];
}

// Client island for the Traspasos catalog -- same role as CatalogoClient for
// Maquinaria: filter changes refetch instantly without a full navigation.
export function TraspasoCatalogoClient({
  filtros,
  initialData,
}: TraspasoCatalogoClientProps) {
  const { data } = useAnunciosTraspaso(filtros, initialData);
  return <AnuncioGrid anuncios={data ?? []} />;
}
