"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RecuperarForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    // The recovery link returns to /api/auth/callback, which exchanges the code
    // for a session and forwards to the set-new-password page. We carry the
    // original destination (`next`) so that, once the password is saved, the
    // user lands back where they started instead of on a default page.
    const destino = `/actualizar-password?next=${encodeURIComponent(next)}`;
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(destino)}`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo },
    );

    setPending(false);
    if (resetError) {
      setError("No se pudo enviar el correo. Inténtalo de nuevo.");
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl leading-tight text-foreground">
          Revisa tu correo
        </h2>
        <p className="text-sm text-muted-foreground">
          Si existe una cuenta con <span className="text-foreground">{email}</span>,
          te hemos enviado un enlace para restablecer tu contraseña. Ábrelo desde
          este dispositivo.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl leading-tight text-foreground">
          Restablecer contraseña
        </h2>
        <p className="text-sm text-muted-foreground">
          Te enviaremos un enlace para crear una nueva contraseña.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="default" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar enlace"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
