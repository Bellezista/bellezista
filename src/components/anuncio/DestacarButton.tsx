"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DestacarDialog } from "@/components/anuncio/DestacarDialog";
import type { TipoAnuncio } from "@generated/prisma/enums";

// Owner CTA on the ficha. Opens the explainer dialog first (benefits + price),
// which then starts the checkout -- no longer jumps straight to payment.
export function DestacarButton({
  anuncioId,
  tipo,
  destacado,
}: {
  anuncioId: string;
  tipo: TipoAnuncio;
  destacado: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen(true)}
        className="h-12 w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
      >
        <Star className="size-4" aria-hidden="true" />
        {destacado ? "Renovar premium" : "Subir a premium"}
      </Button>
      <DestacarDialog
        anuncioId={anuncioId}
        tipo={tipo}
        destacado={destacado}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
