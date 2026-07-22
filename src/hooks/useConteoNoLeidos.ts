import { useQuery } from "@tanstack/react-query";
import { getConteoNoLeidos } from "@/lib/actions/mensajes";

// Drives the "Mensajes" nav badge -- polls independently of whichever page is
// mounted, since the sidebar renders on every (app) route, not just /mensajes.
export function useConteoNoLeidos() {
  return useQuery({
    queryKey: ["conteo-no-leidos"],
    queryFn: () => getConteoNoLeidos(),
    refetchInterval: 15_000,
  });
}
