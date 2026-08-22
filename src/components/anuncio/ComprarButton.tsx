"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { crearCheckoutCompra } from "@/lib/actions/operacion";
import { Button } from "@/components/ui/button";

// Buyer CTA on a listing ficha: starts a secure purchase (payment held until the
// buyer confirms receipt). The Server Action validates eligibility and returns a
// Stripe Checkout URL.
export function ComprarButton({
  anuncioId,
  precioFormateado,
}: {
  anuncioId: string;
  precioFormateado: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function comprar() {
    setError(null);
    startTransition(async () => {
      const res = await crearCheckoutCompra(anuncioId);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.url) window.location.href = res.url;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="lg"
        disabled={pending}
        onClick={comprar}
        className="h-12 w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
      >
        <ShieldCheck className="size-4" aria-hidden="true" />
        {pending ? "Redirigiendo..." : `Comprar con pago seguro · ${precioFormateado}`}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        El dinero queda retenido y solo se libera al vendedor cuando confirmas que
        todo está correcto.
      </p>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
