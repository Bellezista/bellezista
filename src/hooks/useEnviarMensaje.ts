import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enviarMensaje } from "@/lib/actions/mensajes";
import type { MensajeInput } from "@/lib/validation/mensajeSchema";

export function useEnviarMensaje(conversacionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MensajeInput) => enviarMensaje(conversacionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversacion", conversacionId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversaciones"] });
    },
  });
}
