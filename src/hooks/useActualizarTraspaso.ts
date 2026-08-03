import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { actualizarAnuncioTraspaso } from "@/lib/actions/anuncios";
import type { PublicarTraspasoInput } from "@/lib/validation/publicarTraspasoSchema";

export function useActualizarTraspaso(anuncioId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PublicarTraspasoInput) =>
      actualizarAnuncioTraspaso(anuncioId, input),
    onSuccess: (result) => {
      if (!result || "error" in result) return;
      queryClient.invalidateQueries({ queryKey: ["anuncios-traspaso"] });
      queryClient.invalidateQueries({ queryKey: ["mis-anuncios"] });
      router.push(`/anuncios/${anuncioId}`);
    },
  });
}
