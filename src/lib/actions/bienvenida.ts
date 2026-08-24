"use server";

import { after } from "next/server";
import { enviarEmail } from "@/lib/email/enviar";
import { emailBienvenida } from "@/lib/email/plantillas";

// Sends the "Bienvenido a la familia Bellezista" email after registration.
// Called from the registro form once sign-up succeeds. Fire-and-forget: a mail
// failure must never block the registration flow.
export async function enviarEmailBienvenida(
  email: string,
  nombre: string,
): Promise<void> {
  const destino = email.trim();
  if (!destino || !destino.includes("@")) return;
  const limpio = (nombre || "").trim() || "Bienvenido";

  const { subject, html } = emailBienvenida(limpio);
  after(async () => {
    try {
      await enviarEmail(destino, subject, html);
    } catch (e) {
      console.error("No se pudo enviar el email de bienvenida:", e);
    }
  });
}
