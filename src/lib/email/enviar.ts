import "server-only";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from =
  process.env.SMTP_FROM ?? "Bellezista <notificaciones@bellezista.com>";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!host || !user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function enviarEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn("SMTP no configurado: no se envía el correo.");
    return false;
  }
  await t.sendMail({ from, to, subject, html });
  return true;
}
