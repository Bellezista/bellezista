import { useQuery } from "@tanstack/react-query";
import { getConteoNoLeidos } from "@/lib/actions/mensajes";

// Drives the "Mensajes" nav badge -- polls independently of whichever page is
// mounted, since the sidebar renders on every (app) route, not just /mensajes.
// `enabled` is false for anonymous visitors on the public shell (/catalogo,
// /anuncios/[id]) so guests don't poll an auth-only action every 15s -- the
// action itself also returns 0 for guests as a backstop.
export function useConteoNoLeidos(enabled = true) {
  return useQuery({
    queryKey: ["conteo-no-leidos"],
    queryFn: () => getConteoNoLeidos(),
    refetchInterval: 15_000,
    enabled,
  });
}
