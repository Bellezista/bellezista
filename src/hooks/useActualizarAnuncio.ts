import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { actualizarAnuncioMaquinaria } from "@/lib/actions/anuncios";
import type { PublicarMaquinariaInput } from "@/lib/validation/publicarMaquinariaSchema";

export function useActualizarAnuncio(anuncioId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PublicarMaquinariaInput) =>
      actualizarAnuncioMaquinaria(anuncioId, input),
    onSuccess: (result) => {
      if (!result || "error" in result) return;
      queryClient.invalidateQueries({ queryKey: ["anuncios"] });
      queryClient.invalidateQueries({ queryKey: ["mis-anuncios"] });
      router.push(`/anuncios/${result.id}`);
    },
  });
}
