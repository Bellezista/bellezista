import "server-only";
import { prisma } from "@/lib/prisma/client";
import { enviarEmail } from "@/lib/email/enviar";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bellezista.com";

// Emails the recipient of a new message / contact so sellers who don't keep the
// panel open still find out. The recipient's login email is read from
// auth.users (never exposes it to other users). Fire-and-forget: wrap the call
// in `after()` so a mail failure can't affect the messaging flow.
export async function enviarAvisoMensajeEmail(
  destinatarioId: string,
  opts: { asunto: string; encabezado: string; preview?: string; conversacionId: string },
): Promise<void> {
  try {
    const rows = await prisma.$queryRaw<{ email: string }[]>`
      SELECT email FROM auth.users WHERE id = ${destinatarioId}::uuid LIMIT 1`;
    const email = rows[0]?.email;
    if (!email) return;

    const url = `${SITE}/mensajes/${opts.conversacionId}`;
    const preview = opts.preview
      ? `<p style="margin:0 0 16px;padding:12px 14px;background:#f4efe4;border-radius:8px;color:#4a483f;font-size:14px;">${opts.preview}</p>`
      : "";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f4efe4;padding:24px 0;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #e7e4dc;padding:28px;">
          <p style="margin:0 0 12px;font-size:17px;color:#2c2c2a;font-weight:700;">${opts.encabezado}</p>
          <p style="margin:0 0 16px;font-size:15px;color:#4a483f;">
            Tienes un mensaje nuevo en Bellezista. Responde desde tu cuenta.
          </p>
          ${preview}
          <a href="${url}" style="display:inline-block;background:#cda306;color:#2c2c2a;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px;">
            Ver el mensaje
          </a>
          <p style="margin:18px 0 0;font-size:12px;color:#78746c;">
            Por seguridad, la conversación ocurre siempre dentro de Bellezista.
          </p>
        </div>
      </div>`;

    await enviarEmail(email, opts.asunto, html);
  } catch (e) {
    console.error("No se pudo enviar el aviso de mensaje por email:", e);
  }
}
