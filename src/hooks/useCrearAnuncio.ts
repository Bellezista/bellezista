import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { crearAnuncioMaquinaria } from "@/lib/actions/anuncios";
import type { PublicarMaquinariaInput } from "@/lib/validation/publicarMaquinariaSchema";

export function useCrearAnuncio() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PublicarMaquinariaInput) =>
      crearAnuncioMaquinaria(input),
    onSuccess: (result) => {
      if (!result || "error" in result) return;
      queryClient.invalidateQueries({ queryKey: ["anuncios"] });
      queryClient.invalidateQueries({ queryKey: ["mis-anuncios"] });
      router.push(`/anuncios/${result.id}`);
    },
  });
}
