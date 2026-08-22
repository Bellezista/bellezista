"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function ActualizarPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [listo, setListo] = useState(false);
  // null = checking, true = recovery session present, false = no session.
  const [tieneSesion, setTieneSesion] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setTieneSesion(!!data.user));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updErr) {
      setError("No se pudo actualizar la contraseña. Inténtalo de nuevo.");
      return;
    }
    setListo(true);
    router.refresh();
  }

  if (tieneSesion === false) {
    return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl leading-tight text-foreground">
          Enlace no válido
        </h2>
        <p className="text-sm text-muted-foreground">
          El enlace no es válido o ha caducado. Solicita uno nuevo desde
          &ldquo;¿Olvidaste tu contraseña?&rdquo;.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/recuperar" className="text-foreground underline underline-offset-4">
            Pedir un enlace nuevo
          </Link>
        </p>
      </div>
    );
  }

  if (listo) {
    return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl leading-tight text-foreground">
          Contraseña actualizada
        </h2>
        <p className="text-sm text-muted-foreground">
          Ya puedes usar tu nueva contraseña.
        </p>
        <Button asChild variant="default" className="w-full">
          <Link href="/catalogo">Continuar</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl leading-tight text-foreground">
          Crea una nueva contraseña
        </h2>
        <p className="text-sm text-muted-foreground">
          Elige una contraseña para tu cuenta.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <PasswordInput
          id="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        variant="default"
        className="w-full"
        disabled={pending || tieneSesion === null}
      >
        {pending ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
