import { useQuery } from "@tanstack/react-query";
import { getCvs } from "@/lib/actions/talento";
import type { TalentoFiltros, CvResumen } from "@/types/talento";

// Same initialData pattern as the anuncio catalogs: the Server Component paints
// the default view; only the no-filter key may reuse it.
export function useCvs(filtros: TalentoFiltros, initialData?: CvResumen[]) {
  const esFiltroPorDefecto = Object.keys(filtros).length === 0;
  return useQuery({
    queryKey: ["cvs", filtros],
    queryFn: () => getCvs(filtros),
    initialData: esFiltroPorDefecto ? initialData : undefined,
  });
}
