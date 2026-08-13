"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  crearCheckoutDesbloqueo,
  crearCheckoutBono,
  desbloquearConCredito,
} from "@/lib/actions/talentoPagos";
import {
  DESBLOQUEO_INDIVIDUAL,
  BONO_DESBLOQUEOS,
  formatearImporte,
} from "@/lib/talento/precios";
import { Button } from "@/components/ui/button";

export function DesbloquearCta({
  cvId,
  isAuthenticated,
  saldoCreditos,
}: {
  cvId: string;
  isAuthenticated: boolean;
  saldoCreditos: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Button asChild>
          <Link href={`/login?next=/talento/${cvId}`}>
            Inicia sesión para desbloquear
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Necesitas una cuenta de negocio para acceder a los CVs.
        </p>
      </div>
    );
  }

  function irACheckout(accion: () => Promise<{ url?: string; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await accion();
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.url) window.location.href = res.url;
    });
  }

  function usarCredito() {
    setError(null);
    startTransition(async () => {
      const res = await desbloquearConCredito(cvId);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {saldoCreditos > 0 && (
        <Button className="w-full" disabled={pending} onClick={usarCredito}>
          Usar 1 desbloqueo del bono ({saldoCreditos} disponibles)
        </Button>
      )}

      <Button
        variant={saldoCreditos > 0 ? "outline" : "default"}
        className="w-full"
        disabled={pending}
        onClick={() => irACheckout(() => crearCheckoutDesbloqueo(cvId))}
      >
        Desbloquear este CV ·{" "}
        {formatearImporte(DESBLOQUEO_INDIVIDUAL.importe, DESBLOQUEO_INDIVIDUAL.moneda)}
      </Button>

      {saldoCreditos === 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={() => irACheckout(() => crearCheckoutBono())}
          className="text-xs text-muted-foreground underline decoration-gold underline-offset-4 transition-colors hover:text-gold disabled:opacity-50"
        >
          O compra el {BONO_DESBLOQUEOS.nombre.toLowerCase()} por{" "}
          {formatearImporte(BONO_DESBLOQUEOS.importe, BONO_DESBLOQUEOS.moneda)}
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
