"use client";

import { useState, useTransition } from "react";
import { crearCheckoutSuscripcion } from "@/lib/actions/suscripcion";
import type { PlanPro } from "@generated/prisma/enums";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SuscribirseButton({
  plan,
  destacado = false,
  label = "Suscribirme",
}: {
  plan: PlanPro;
  destacado?: boolean;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function suscribir() {
    setError(null);
    startTransition(async () => {
      const res = await crearCheckoutSuscripcion(plan);
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
        className={cn(
          "h-11 w-full rounded-full text-sm font-semibold",
          destacado
            ? "bg-gold text-foreground hover:bg-gold/90"
            : "border border-gold bg-transparent text-gold hover:bg-gold hover:text-foreground",
        )}
        disabled={pending}
        onClick={suscribir}
      >
        {pending ? "Redirigiendo..." : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
