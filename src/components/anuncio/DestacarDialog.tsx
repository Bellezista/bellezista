"use client";

import { useState, useTransition } from "react";
import { Check, Star } from "lucide-react";
import { crearCheckoutDestacado } from "@/lib/actions/destacado";
import { DESTACADO_PRECIOS } from "@/lib/anuncio/destacado-precios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TipoAnuncio } from "@generated/prisma/enums";

function formatEuros(centimos: number): string {
  const euros = centimos / 100;
  const str =
    centimos % 100 === 0
      ? String(euros)
      : euros.toFixed(2).replace(".", ",");
  return `${str} €`;
}

const BENEFICIOS = [
  "Aparece primero en los resultados de búsqueda",
  "Marco dorado que destaca tu anuncio del resto",
  "Más tiempo visible frente a otros anuncios similares",
];

// Intermediate explainer shown before the destacado checkout, so the user sees
// why it's worth it (and the exact price/duration for the section) before paying.
export function DestacarDialog({
  anuncioId,
  tipo,
  destacado,
  open,
  onOpenChange,
}: {
  anuncioId: string;
  tipo: TipoAnuncio;
  destacado: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const cfg = DESTACADO_PRECIOS[tipo];
  const precio = formatEuros(cfg.importe);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="size-5 text-gold" aria-hidden="true" />
            {destacado ? "Renueva tu anuncio destacado" : "Destaca tu anuncio"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Los anuncios destacados aparecen siempre antes que los anuncios
            normales en los resultados de búsqueda, y llevan el marco dorado que
            los distingue a simple vista en el catálogo.
          </p>

          <ul className="space-y-2">
            {BENEFICIOS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex items-baseline justify-center gap-2 rounded-lg bg-cream py-3">
            <span className="font-serif text-2xl text-gold">{precio}</span>
            <span className="text-sm text-muted-foreground">
              · {cfg.dias} días
            </span>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={pending}
            onClick={destacar}
            className="h-12 w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            <Star className="size-4" aria-hidden="true" />
            {pending
              ? "Redirigiendo al pago..."
              : destacado
                ? "Renovar ahora"
                : "Destacar ahora"}
          </Button>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
