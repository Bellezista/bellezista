import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { guardarMiCv } from "@/lib/actions/talento";
import type { CvInput } from "@/lib/validation/cvSchema";

export function useGuardarCv() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CvInput) => guardarMiCv(input),
    onSuccess: (result) => {
      if (!result || "error" in result) return;
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      router.push(`/talento/${result.id}`);
    },
  });
}
