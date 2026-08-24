import "server-only";

// Shared email templates. Images are hosted in the public Supabase bucket so
// they load in email clients without attachments.
const BUCKET =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site";

const IMG_BIENVENIDA = `${BUCKET}/email-bienvenida.jpg`;
const IMG_TALENTO = `${BUCKET}/email-talento.jpg`;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bellezista.com";

function marco(imgUrl: string, alt: string, cuerpo: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4efe4;padding:24px 0;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e7e4dc;">
      <img src="${imgUrl}" alt="${alt}" style="display:block;width:100%;height:auto;" />
      <div style="padding:28px 28px 8px;color:#2c2c2a;">
        ${cuerpo}
      </div>
      <div style="padding:18px 28px 26px;">
        <a href="${SITE}" style="display:inline-block;background:#cda306;color:#2c2c2a;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px;">
          Ir a Bellezista
        </a>
      </div>
      <div style="border-top:1px solid #e7e4dc;padding:16px 28px;color:#78746c;font-size:12px;">
        Bellezista · El mundo de la belleza, en un solo lugar
      </div>
    </div>
  </div>`;
}

// Sent right after someone registers.
export function emailBienvenida(nombre: string): { subject: string; html: string } {
  const cuerpo = `
    <p style="font-size:16px;line-height:1.6;margin:0 0 12px;">Hola ${nombre},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 12px;color:#4a483f;">
      Te damos la bienvenida a Bellezista, el espacio pensado solo para
      profesionales del sector de la belleza. Aquí puedes traspasar tu negocio,
      comprar o vender maquinaria y encontrar profesionales, todo en un mismo
      lugar.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0;color:#4a483f;">
      Cuando quieras, publica tu primer anuncio y empieza.
    </p>`;
  return {
    subject: "Bienvenido a la familia Bellezista",
    html: marco(IMG_BIENVENIDA, "Bienvenido a la familia Bellezista", cuerpo),
  };
}

// Sent the first time a professional publishes their CV in Empleo & Talento.
export function emailBienvenidaTalento(nombre: string): {
  subject: string;
  html: string;
} {
  const cuerpo = `
    <p style="font-size:16px;line-height:1.6;margin:0 0 12px;">Hola ${nombre},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 12px;color:#4a483f;">
      Tu perfil profesional ya está publicado en Bellezista. A partir de ahora,
      los centros y negocios del sector pueden encontrarte y contactarte.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0;color:#4a483f;">
      Tu talento tiene su lugar. Lleva tu carrera al siguiente nivel.
    </p>`;
  return {
    subject: "Tu talento ya tiene su lugar en Bellezista",
    html: marco(IMG_TALENTO, "Bellezista Talento", cuerpo),
  };
}
