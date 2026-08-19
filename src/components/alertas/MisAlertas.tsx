"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { borrarAlerta } from "@/lib/actions/alertas";
import { describeAlerta } from "@/lib/alertas/describe";
import type { SeccionAlerta } from "@generated/prisma/enums";
import { Button } from "@/components/ui/button";

export type AlertaItem = {
  id: string;
  seccion: SeccionAlerta;
  filtros: unknown;
};

export function MisAlertas({ alertas: iniciales }: { alertas: AlertaItem[] }) {
  const [alertas, setAlertas] = useState(iniciales);
  const [pending, startTransition] = useTransition();

  function borrar(id: string) {
    startTransition(async () => {
      await borrarAlerta(id);
      setAlertas((a) => a.filter((x) => x.id !== id));
    });
  }

  if (alertas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tienes alertas guardadas. Crea una desde los filtros de cualquier
        sección con el botón &ldquo;Crear alerta con estos filtros&rdquo;.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {alertas.map((a) => {
        const d = describeAlerta(a.seccion, a.filtros);
        return (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{d.seccion}</p>
              <p className="truncate text-xs text-muted-foreground">
                {d.partes.length ? d.partes.join(" · ") : "Todos los anuncios"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={pending}
              onClick={() => borrar(a.id)}
              aria-label="Borrar alerta"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
