import { useQuery } from "@tanstack/react-query";
import { getConversacion } from "@/lib/actions/mensajes";
import type { ConversacionConMensajes } from "@/types/mensajeria";

export function useMensajes(
  conversacionId: string,
  initialData?: ConversacionConMensajes | null,
) {
  return useQuery({
    queryKey: ["conversacion", conversacionId],
    queryFn: () => getConversacion(conversacionId),
    initialData,
    refetchInterval: 10_000,
  });
}
