"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BellPlus, Check } from "lucide-react";

import { crearAlerta } from "@/lib/actions/alertas";
import type { SeccionAlerta } from "@generated/prisma/enums";
import { Button } from "@/components/ui/button";

// "Crear alerta con estos filtros" -- saves the section's current URL filters as
// a saved search. Shown next to the search bar in each section.
export function CrearAlertaButton({
  seccion,
  filtros: filtrosProp,
  className,
  label = "Crear alerta con estos filtros",
}: {
  seccion: SeccionAlerta;
  // When provided (client-side filter state), these are saved instead of the
  // URL query params.
  filtros?: Record<string, string>;
  // Extra classes for the idle button (e.g. w-full inside a sidebar panel).
  className?: string;
  // Idle-state label (shortened where space is tight, e.g. a narrow sidebar).
  label?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [estado, setEstado] = useState<"idle" | "creada" | "noauth" | "error">(
    "idle",
  );

  function crear() {
    const filtros =
      filtrosProp ?? Object.fromEntries(searchParams.entries());
    startTransition(async () => {
      const res = await crearAlerta(seccion, filtros);
      if (res.error === "NO_AUTH") return setEstado("noauth");
      if (res.error) return setEstado("error");
      setEstado("creada");
    });
  }

  if (estado === "creada") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold">
        <Check className="size-4" aria-hidden="true" />
        Alerta creada
      </span>
    );
  }

  if (estado === "noauth") {
    const qs = searchParams.toString();
    const next = encodeURIComponent(`${pathname}${qs ? `?${qs}` : ""}`);
    return (
      <Button asChild variant="outline" size="sm">
        <Link href={`/login?next=${next}`}>Inicia sesión para crear la alerta</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={crear}
      className={`gap-2 whitespace-nowrap rounded-full border-gold bg-gold/10 font-semibold text-gold hover:bg-gold hover:text-foreground ${className ?? ""}`}
    >
      <BellPlus className="size-4" aria-hidden="true" />
      {pending ? "Creando..." : label}
    </Button>
  );
}
