import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { crearAnuncioTraspaso } from "@/lib/actions/anuncios";
import type { PublicarTraspasoInput } from "@/lib/validation/publicarTraspasoSchema";

export function useCrearTraspaso() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PublicarTraspasoInput) => crearAnuncioTraspaso(input),
    onSuccess: (result) => {
      if (!result || "error" in result) return;
      queryClient.invalidateQueries({ queryKey: ["anuncios-traspaso"] });
      queryClient.invalidateQueries({ queryKey: ["mis-anuncios"] });
      router.push(`/anuncios/${result.id}`);
    },
  });
}
