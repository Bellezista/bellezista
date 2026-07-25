"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegistroForm({ next }: { next: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmacionEnviada, setConfirmacionEnviada] = useState(false);
  // Correo ya registrado. Supabase oculta si está confirmado o no (protección
  // anti-enumeración: ambos casos devuelven `identities` vacío), así que no
  // damos un error sin salida -- ofrecemos reenviar la verificación (funciona
  // si la cuenta no está confirmada) y el enlace a iniciar sesión.
  const [cuentaExistente, setCuentaExistente] = useState(false);
  const [reenviado, setReenviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    // El enlace de confirmación debe volver al MISMO origen donde el usuario
    // se registró (producción o local), a la ruta que intercambia el `code`
    // por una sesión (/api/auth/callback), conservando el `next`. Sin esto,
    // Supabase usa la Site URL del proyecto como destino y manda al usuario a
    // la raíz `/` (que no canjea el código) -- por eso el enlace acababa en
    // http://localhost:3000/?code=... El origen se resuelve en el navegador,
    // así que en el sitio live es la URL de producción automáticamente.
    // (Requiere que esa URL esté en la allowlist de Redirect URLs de Supabase.)
    const emailRedirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
      next,
    )}`;

    // nombre -> raw_user_meta_data.nombre, leído por el trigger
    // auth.users -> public.usuario (supabase/migrations/0003) para crear la
    // fila de Usuario con ese nombre en vez del fallback (parte local del email).
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre }, emailRedirectTo },
    });

    setPending(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Con confirmación de email activada, Supabase NO devuelve error si el
    // correo ya está registrado (lo oculta para evitar enumeración de
    // usuarios): devuelve un `user` ficticio con `identities` vacío y sin
    // sesión. Sin este chequeo, un correo ya existente mostraría el mensaje
    // engañoso de "confirmación enviada" en vez de impedir el registro.
    if (data.user && data.user.identities?.length === 0) {
      setCuentaExistente(true);
      return;
    }

    if (!data.session) {
      // Confirmación de email requerida antes de poder iniciar sesión.
      setConfirmacionEnviada(true);
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleReenviar() {
    setError(null);
    setPending(true);
    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
      next,
    )}`;
    // `resend` reenvía la confirmación si la cuenta existe y NO está
    // confirmada. Si ya está confirmada, Supabase devuelve error -> guiamos a
    // iniciar sesión. Reusa el mismo redirect que el alta para que el enlace
    // vuelva al origen correcto (no a localhost).
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo },
    });
    setPending(false);
    if (resendError) {
      setError(
        "Esta cuenta ya está verificada. Inicia sesión con tu contraseña.",
      );
      return;
    }
    setReenviado(true);
  }

  if (cuentaExistente) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ya existe una cuenta con{" "}
          <span className="text-foreground">{email}</span>. Si aún no la has
          verificado, reenvía el correo de confirmación. Si ya la verificaste,
          inicia sesión.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {reenviado ? (
          <p className="text-sm text-muted-foreground">
            Te reenviamos el correo de confirmación. Abre el enlace desde este
            dispositivo para activar tu cuenta.
          </p>
        ) : (
          <Button
            type="button"
            variant="default"
            className="w-full"
            disabled={pending}
            onClick={handleReenviar}
          >
            {pending ? "Enviando..." : "Reenviar correo de verificación"}
          </Button>
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    );
  }

  if (confirmacionEnviada) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Te enviamos un correo de confirmación. Abre el enlace desde este
        dispositivo para activar tu cuenta e iniciar sesión.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
        />
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
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="default" className="w-full" disabled={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
