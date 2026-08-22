"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellPlus, Check } from "lucide-react";

import { crearAlerta } from "@/lib/actions/alertas";
import type { SeccionAlerta } from "@generated/prisma/enums";
import { Button } from "@/components/ui/button";

// Creates a saved-search alert with preset filters (e.g. from a listing's
// business type), for the "avísame de anuncios similares" prompt on the ficha.
export function AlertaSimilaresButton({
  seccion,
  filtros,
  etiqueta = "Crear alerta de anuncios similares",
}: {
  seccion: SeccionAlerta;
  filtros: Record<string, string>;
  etiqueta?: string;
}) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [estado, setEstado] = useState<"idle" | "creada" | "noauth" | "error">(
    "idle",
  );

  function crear() {
    startTransition(async () => {
      const res = await crearAlerta(seccion, filtros);
      if (res.error === "NO_AUTH") return setEstado("noauth");
      if (res.error) return setEstado("error");
      setEstado("creada");
    });
  }

  if (estado === "creada") {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-gold">
        <Check className="size-4" aria-hidden="true" />
        Alerta creada. Te avisaremos por email.
      </p>
    );
  }

  if (estado === "noauth") {
    return (
      <Button asChild variant="outline" className="w-full">
        <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
          Inicia sesión para crear la alerta
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={crear}
      className="w-full gap-2 border-gold text-gold hover:bg-gold hover:text-foreground"
    >
      <BellPlus className="size-4" aria-hidden="true" />
      {pending ? "Creando..." : etiqueta}
    </Button>
  );
}
