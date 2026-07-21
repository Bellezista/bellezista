import { useQuery } from "@tanstack/react-query";
import { getConversaciones } from "@/lib/actions/mensajes";
import type { ConversacionConUltimoMensaje } from "@/types/mensajeria";

// Polling, not Realtime -- a pragmatic MVP choice for this budget/timeline
// (see the plan's data-fetching strategy). Supabase Realtime is a good Fase 2
// upgrade since the project is already on Supabase.
export function useConversaciones(initialData?: ConversacionConUltimoMensaje[]) {
  return useQuery({
    queryKey: ["conversaciones"],
    queryFn: () => getConversaciones(),
    initialData,
    refetchInterval: 15_000,
  });
}
