import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marcarConversacionLeida } from "@/lib/actions/mensajes";

// Invalidates both badge sources immediately instead of waiting for their
// next poll -- opening a thread should clear its unread count right away.
export function useMarcarLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversacionId: string) =>
      marcarConversacionLeida(conversacionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conteo-no-leidos"] });
      queryClient.invalidateQueries({ queryKey: ["conversaciones"] });
    },
  });
}
