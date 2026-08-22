"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import {
  crearEnlaceOnboarding,
  crearEnlacePanelCobros,
} from "@/lib/actions/connect";
import { Button } from "@/components/ui/button";

interface Props {
  tieneCuenta: boolean;
  cobrosActivos: boolean;
  datosPendientes: boolean;
}

// Seller-side Stripe Connect onboarding + status, shown in the profile. Sellers
// must activate payouts before buyers can pay them through the secure flow.
export function ActivarCobrosCard({ cobrosActivos, datosPendientes }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function activar() {
    setError(null);
    startTransition(async () => {
      const res = await crearEnlaceOnboarding();
      if (res.error) return setError(res.error);
      if (res.url) window.location.href = res.url;
    });
  }

  function abrirPanel() {
    setError(null);
    startTransition(async () => {
      const res = await crearEnlacePanelCobros();
      if (res.error) return setError(res.error);
      if (res.url) window.location.href = res.url;
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-gold" aria-hidden="true" />
        <h2 className="font-serif text-xl text-foreground">Cobros de tus ventas</h2>
      </div>

      {cobrosActivos ? (
        <div className="mt-3 space-y-3">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <BadgeCheck className="size-4 text-gold" aria-hidden="true" />
            Cobros activados. Los compradores ya pueden pagarte con pago seguro.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={abrirPanel}
          >
            Ver mis cobros
          </Button>
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            {datosPendientes
              ? "Te falta completar algunos datos para poder recibir pagos. Termina la activación para que los compradores puedan pagarte."
              : "Activa los cobros para vender con pago seguro. El comprador paga en Bellezista, el dinero queda retenido, y lo recibes cuando confirma la recepción. Bellezista retiene una comisión del 10%."}
          </p>
          <Button
            type="button"
            disabled={pending}
            onClick={activar}
            className="gap-2 rounded-full bg-gold font-semibold text-foreground hover:bg-gold/90"
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            {pending
              ? "Redirigiendo..."
              : datosPendientes
                ? "Completar activación"
                : "Activar cobros"}
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
