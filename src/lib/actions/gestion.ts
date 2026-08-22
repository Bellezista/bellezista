"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { enviarEmail } from "@/lib/email/enviar";
import { formatPrecio } from "@/lib/format";

// Where lead notifications land. Overridable via env; defaults to the shared
// notifications mailbox the client checks.
const EMAIL_GESTION = process.env.GESTION_EMAIL ?? "notificaciones@bellezista.com";

// Captures a lead when someone requests SoluciónOK's professional management,
// and emails the notifications mailbox so the team follows up by hand (10% a
// éxito). SoluciónOK follows up by hand.
export async function solicitarGestionProfesional(input: {
  titulo?: string;
  precio?: number;
  provincia?: string;
  seccion?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión para solicitar la ayuda." };

  await prisma.solicitudGestion.create({
    data: {
      usuarioId: user.id,
      titulo: input.titulo?.trim() || null,
      precio:
        typeof input.precio === "number" && Number.isFinite(input.precio)
          ? input.precio
          : null,
      provincia: input.provincia ?? null,
    },
  });

  // Notify the team by email (non-blocking: the lead is already saved).
  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { nombre: true },
  });
  const nombre = usuario?.nombre ?? "Un usuario";
  const email = user.email ?? "sin correo";
  const seccion = input.seccion ?? "Traspasos";

  const filas = [
    ["Solicitante", nombre],
    ["Correo", email],
    ["Sección", seccion],
    input.titulo ? ["Anuncio", input.titulo] : null,
    typeof input.precio === "number" ? ["Precio", formatPrecio(String(input.precio))] : null,
    input.provincia ? ["Provincia", input.provincia] : null,
  ].filter(Boolean) as [string, string][];

  const html = `
    <div style="font-family:Arial,sans-serif;color:#2c2c2a">
      <h2 style="margin:0 0 12px">Nueva solicitud: contacto de un profesional</h2>
      <p style="margin:0 0 16px">
        <strong>${nombre}</strong> quiere que un profesional de Bellezista le
        contacte para ayudarle con ${seccion.toLowerCase()}.
      </p>
      <table style="border-collapse:collapse">
        ${filas
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 12px 4px 0;color:#78746c">${k}</td><td style="padding:4px 0"><strong>${v}</strong></td></tr>`,
          )
          .join("")}
      </table>
    </div>`;

  after(async () => {
    try {
      await enviarEmail(
        EMAIL_GESTION,
        `Nueva solicitud de gestión: ${nombre}`,
        html,
      );
    } catch (e) {
      console.error("No se pudo enviar el email de solicitud de gestión:", e);
    }
  });

  return { ok: true };
}
