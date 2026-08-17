"use client";

import { useState, useTransition } from "react";
import { crearCheckoutKit } from "@/lib/actions/kitTraspaso";
import { KIT_TRASPASO } from "@/lib/traspaso/kit";
import { formatearImporte } from "@/lib/talento/precios";
import { Button } from "@/components/ui/button";

export function ComprarKitButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function comprar() {
    setError(null);
    startTransition(async () => {
      const res = await crearCheckoutKit();
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
        size="lg"
        disabled={pending}
        onClick={comprar}
        className="h-12 rounded-full bg-gold px-8 text-sm font-semibold text-foreground hover:bg-gold/90"
      >
        {pending
          ? "Redirigiendo al pago..."
          : `Comprar Kit Traspaso · ${formatearImporte(KIT_TRASPASO.importe, KIT_TRASPASO.moneda)}`}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
