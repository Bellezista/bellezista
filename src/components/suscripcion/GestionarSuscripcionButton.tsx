"use client";

import { useState, useTransition } from "react";
import { crearPortalSuscripcion } from "@/lib/actions/suscripcion";
import { Button } from "@/components/ui/button";

export function GestionarSuscripcionButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    setError(null);
    startTransition(async () => {
      const res = await crearPortalSuscripcion();
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.url) window.location.href = res.url;
    });
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" disabled={pending} onClick={abrir}>
        {pending ? "Abriendo..." : "Gestionar suscripción"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
