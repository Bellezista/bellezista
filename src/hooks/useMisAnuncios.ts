import { useQuery } from "@tanstack/react-query";
import { getMisAnuncios } from "@/lib/actions/anuncios";
import type { MisAnuncioSerializado } from "@/types/anuncio";

// getMisAnuncios already returns serialized (Decimal-free) data -- see
// src/lib/actions/anuncios.ts and useAnuncios.ts's comment for why that has
// to live in the Server Action itself, not just at the page level.
export function useMisAnuncios(initialData?: MisAnuncioSerializado[]) {
  return useQuery({
    queryKey: ["mis-anuncios"],
    queryFn: () => getMisAnuncios(),
    initialData,
  });
}
