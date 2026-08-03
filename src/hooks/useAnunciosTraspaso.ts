import { useQuery } from "@tanstack/react-query";
import { getAnunciosTraspaso } from "@/lib/actions/anuncios";
import type { CatalogoFiltros, AnuncioSerializado } from "@/types/anuncio";

// Same pattern as useAnuncios (Maquinaria): the Server Component paints the
// default view and passes it as initialData; only the no-filter query key may
// use it, everything else fetches fresh.
export function useAnunciosTraspaso(
  filtros: CatalogoFiltros,
  initialData?: AnuncioSerializado[],
) {
  const esFiltroPorDefecto = Object.keys(filtros).length === 0;

  return useQuery({
    queryKey: ["anuncios-traspaso", filtros],
    queryFn: () => getAnunciosTraspaso(filtros),
    initialData: esFiltroPorDefecto ? initialData : undefined,
  });
}
