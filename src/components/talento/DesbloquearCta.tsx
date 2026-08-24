"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import {
  crearCheckoutPack,
  desbloquearConCredito,
} from "@/lib/actions/talentoPagos";
import {
  TALENTO_PACKS,
  TALENTO_PACKS_LISTA,
  formatearImporte,
} from "@/lib/talento/precios";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
            Inicia sesión para acceder
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Necesitas una cuenta de negocio para acceder a los CVs.
        </p>
      </div>
    );
  }

  function usarCredito() {
    setError(null);
    startTransition(async () => {
      const res = await desbloquearConCredito(cvId);
      if (res.error) return setError(res.error);
      router.refresh();
    });
  }

  function comprarPack(packId: string) {
    setError(null);
    startTransition(async () => {
      const res = await crearCheckoutPack(packId);
      if (res.error) return setError(res.error);
      if (res.url) window.location.href = res.url;
    });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {saldoCreditos > 0 && (
        <>
          <Button className="w-full" disabled={pending} onClick={usarCredito}>
            Usar 1 desbloqueo ({saldoCreditos} disponibles)
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            ¿Necesitas más o acceso ilimitado? Elige un pack:
          </p>
        </>
      )}

      {saldoCreditos === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Para ver este CV, elige un pack de acceso:
        </p>
      )}

      {/* Upsell: nudge from the basic pack (Inicio) toward unlimited (3 meses). */}
      <div className="rounded-lg border border-gold/40 bg-gold/10 p-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Mejor valor:</strong> con el{" "}
            {TALENTO_PACKS.M3.nombre} ({formatearImporte(TALENTO_PACKS.M3.importe)})
            tienes <strong>CVs ilimitados durante 3 meses</strong>. Tres{" "}
            {TALENTO_PACKS.INICIO.nombre} cuestan{" "}
            {formatearImporte(TALENTO_PACKS.INICIO.importe * 3)} y solo te dan 15
            CVs.
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {TALENTO_PACKS_LISTA.map((pack) => {
          const recomendado = pack.id === "M3";
          return (
            <button
              key={pack.id}
              type="button"
              disabled={pending}
              onClick={() => comprarPack(pack.id)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:border-gold disabled:opacity-50",
                recomendado ? "border-2 border-gold" : "border-border",
              )}
            >
              <span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {pack.nombre}
                  </span>
                  {recomendado && (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                      Recomendado
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {pack.descripcion}
                </span>
              </span>
              <span className="shrink-0 font-serif text-lg text-gold">
                {formatearImporte(pack.importe, pack.moneda)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <Check className="size-3 text-gold" aria-hidden="true" />
        Contacto siempre por mensajería interna, sin exponer datos.
      </p>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
