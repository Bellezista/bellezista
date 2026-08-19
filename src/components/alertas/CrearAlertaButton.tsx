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
export function CrearAlertaButton({ seccion }: { seccion: SeccionAlerta }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [estado, setEstado] = useState<"idle" | "creada" | "noauth" | "error">(
    "idle",
  );

  function crear() {
    const filtros = Object.fromEntries(searchParams.entries());
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
      size="sm"
      disabled={pending}
      onClick={crear}
      className="gap-1.5 whitespace-nowrap"
    >
      <BellPlus className="size-4" aria-hidden="true" />
      {pending ? "Creando..." : "Crear alerta con estos filtros"}
    </Button>
  );
}
