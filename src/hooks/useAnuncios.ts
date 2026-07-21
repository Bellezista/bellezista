import { useQuery } from "@tanstack/react-query";
import { getAnunciosMaquinaria } from "@/lib/actions/anuncios";
import type { CatalogoFiltros, AnuncioSerializado } from "@/types/anuncio";

// Server Component does the first paint for the default (no-filter) catalog
// view (see (public)/catalogo/page.tsx) and passes it in as initialData --
// but ONLY the default/no-filter query key may use it, otherwise switching
// filters would flash stale SSR data before the real fetch resolves. Any
// other filter combination just fetches fresh via queryFn.
//
// getAnunciosMaquinaria already returns serialized (Decimal-free) data --
// see src/lib/actions/anuncios.ts. It has to happen inside the Server Action
// itself, not just at the page level: this hook calls it directly as a
// client-invoked Server Action, and the action's return value crosses the
// same React-serialization boundary the instant it's invoked that way
// (confirmed live -- page-level serialization alone didn't stop the warning
// from recurring on every filter-triggered refetch).
export function useAnuncios(
  filtros: CatalogoFiltros,
  initialData?: AnuncioSerializado[],
) {
  const esFiltroPorDefecto = Object.keys(filtros).length === 0;

  return useQuery({
    queryKey: ["anuncios", filtros],
    queryFn: () => getAnunciosMaquinaria(filtros),
    initialData: esFiltroPorDefecto ? initialData : undefined,
  });
}
