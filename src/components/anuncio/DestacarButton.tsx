"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { crearCheckoutDestacado } from "@/lib/actions/destacado";
import { Button } from "@/components/ui/button";

export function DestacarButton({
  anuncioId,
  destacado,
}: {
  anuncioId: string;
  destacado: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function destacar() {
    setError(null);
    startTransition(async () => {
      const res = await crearCheckoutDestacado(anuncioId);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.url) window.location.href = res.url;
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        disabled={pending}
        onClick={destacar}
        className="h-12 w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
      >
        <Star className="size-4" aria-hidden="true" />
        {pending
          ? "Redirigiendo..."
          : destacado
            ? "Renovar premium"
            : "Subir a premium"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
