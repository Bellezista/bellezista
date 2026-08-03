"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// The four Bellezista services shown as tabs under the hero headline. Only
// Maquinaria is live today; the rest render but are marked "próximamente", so
// the home reads as a multi-service platform from day one (client request).
// Selecting a tab swaps the primary CTA to that service.
const MODULOS = [
  { key: "maquinaria", label: "Maquinaria", href: "/catalogo", activo: true },
  { key: "traspasos", label: "Traspasos", href: "/traspasos", activo: true },
  { key: "talento", label: "Talento", href: null, activo: false },
  { key: "ofertas", label: "Ofertas", href: null, activo: false },
] as const;

export function HeroTabs() {
  const [seleccion, setSeleccion] = useState(0);
  const modulo = MODULOS[seleccion];

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Servicios de Bellezista"
        className="flex flex-wrap gap-2.5"
      >
        {MODULOS.map((m, i) => {
          const activo = i === seleccion;
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => setSeleccion(i)}
              className={cn(
                "rounded-lg border px-5 py-2.5 text-sm transition-colors",
                activo
                  ? "border-gold bg-gold/10 font-semibold text-gold"
                  : "border-background/25 text-background/80 hover:border-background/50 hover:text-background",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        {modulo.activo && modulo.href ? (
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-gold px-8 text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            <Link href={modulo.href}>Explorar {modulo.label}</Link>
          </Button>
        ) : (
          <Button
            size="lg"
            disabled
            className="h-12 cursor-not-allowed rounded-full bg-gold/50 px-8 text-sm font-semibold text-foreground"
          >
            {modulo.label} · próximamente
          </Button>
        )}
        <Link
          href="/publicar"
          className="text-sm text-background underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
        >
          Publicar un anuncio
        </Link>
      </div>
    </div>
  );
}
