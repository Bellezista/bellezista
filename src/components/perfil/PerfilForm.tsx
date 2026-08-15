"use client";

import { useState, useTransition } from "react";
import { actualizarMiContacto } from "@/lib/actions/contacto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PerfilForm({
  defaultEmail,
  defaultTelefono,
}: {
  defaultEmail: string;
  defaultTelefono: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [telefono, setTelefono] = useState(defaultTelefono);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardado(false);
    startTransition(async () => {
      try {
        await actualizarMiContacto({ email, telefono: telefono || undefined });
        setGuardado(true);
      } catch {
        setError("No se pudo guardar. Intenta de nuevo.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo de contacto</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setGuardado(false);
          }}
        />
        <p className="text-xs text-muted-foreground">
          El correo que ven los interesados cuando contactas con ellos.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="telefono">Teléfono (opcional)</Label>
        <Input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => {
            setTelefono(e.target.value);
            setGuardado(false);
          }}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {guardado && (
        <p className="text-sm text-gold">Datos de contacto guardados.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
