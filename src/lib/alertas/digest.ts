import "server-only";
import { prisma } from "@/lib/prisma/client";
import { enviarEmail } from "@/lib/email/enviar";
import { describeAlerta } from "@/lib/alertas/describe";
import { PUESTO_TALENTO_LABEL } from "@/lib/anuncio/labels";
import type { SeccionAlerta } from "@generated/prisma/enums";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bellezista.com"
).replace(/\/$/, "");

const DIAS = 7;

type Match = { titulo: string; detalle: string; url: string };

function precioFilter(f: Record<string, string>) {
  const precio: { gte?: number; lte?: number } = {};
  if (f.precioMin) precio.gte = Number(f.precioMin);
  if (f.precioMax) precio.lte = Number(f.precioMax);
  return Object.keys(precio).length ? precio : undefined;
}

async function coincidencias(
  seccion: SeccionAlerta,
  filtros: unknown,
  desde: Date,
): Promise<Match[]> {
  const f = (filtros ?? {}) as Record<string, string>;

  if (seccion === "TALENTO") {
    const cvs = await prisma.cv.findMany({
      where: {
        visible: true,
        creadoEn: { gte: desde },
        ...(f.puesto && { puesto: f.puesto as never }),
        ...(f.ciudad && {
          provincia: { contains: f.ciudad, mode: "insensitive" },
        }),
        ...(f.q && {
          OR: [
            { presentacion: { contains: f.q, mode: "insensitive" } },
            { titulacion: { contains: f.q, mode: "insensitive" } },
            { cursos: { contains: f.q, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        puesto: true,
        provincia: true,
        aniosExperiencia: true,
      },
      orderBy: { creadoEn: "desc" },
      take: 15,
    });
    return cvs.map((c) => ({
      titulo: `${PUESTO_TALENTO_LABEL[c.puesto]} · ${c.aniosExperiencia} años`,
      detalle: c.provincia,
      url: `${SITE_URL}/talento/${c.id}`,
    }));
  }

  const tipo = seccion === "TRASPASOS" ? "TRASPASO" : "MAQUINARIA";
  const precio = precioFilter(f);
  const anuncios = await prisma.anuncio.findMany({
    where: {
      tipo: tipo as never,
      estado: "ACTIVO",
      creadoEn: { gte: desde },
      ...(f.ciudad && {
        ciudadProvincia: { contains: f.ciudad, mode: "insensitive" },
      }),
      ...(f.q && { titulo: { contains: f.q, mode: "insensitive" } }),
      ...(precio && { precio }),
      ...(f.tipoNegocio && {
        traspaso: { is: { tipoNegocio: f.tipoNegocio as never } },
      }),
      ...((f.categoria || f.marca) && {
        maquinaria: {
          is: {
            ...(f.categoria && { categoria: f.categoria as never }),
            ...(f.marca && { marca: { contains: f.marca, mode: "insensitive" } }),
          },
        },
      }),
    },
    select: { id: true, titulo: true, ciudadProvincia: true, precio: true },
    orderBy: { creadoEn: "desc" },
    take: 15,
  });
  return anuncios.map((a) => ({
    titulo: a.titulo,
    detalle: `${a.ciudadProvincia} · ${Number(a.precio).toLocaleString("es-ES")} €`,
    url: `${SITE_URL}/anuncios/${a.id}`,
  }));
}

function bloqueHtml(resumen: string, matches: Match[]): string {
  const items = matches
    .map(
      (m) =>
        `<li style="margin:0 0 10px"><a href="${m.url}" style="color:#111;text-decoration:none;font-weight:600">${m.titulo}</a><br><span style="color:#666;font-size:13px">${m.detalle}</span></li>`,
    )
    .join("");
  return `<div style="margin:0 0 24px"><p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#cda306;margin:0 0 8px">${resumen}</p><ul style="list-style:none;padding:0;margin:0">${items}</ul></div>`;
}

// Runs the weekly digest: for each user with alerts, gathers the new listings
// that matched this week and emails them one summary. Returns a small report.
export async function procesarAlertasSemanales(): Promise<{
  usuarios: number;
  correosEnviados: number;
}> {
  const desde = new Date(Date.now() - DIAS * 24 * 60 * 60 * 1000);
  const alertas = await prisma.alerta.findMany({
    orderBy: { creadoEn: "asc" },
  });
  if (alertas.length === 0) return { usuarios: 0, correosEnviados: 0 };

  // Group alerts by user.
  const porUsuario = new Map<string, typeof alertas>();
  for (const a of alertas) {
    const arr = porUsuario.get(a.usuarioId) ?? [];
    arr.push(a);
    porUsuario.set(a.usuarioId, arr);
  }

  // Emails live in auth.users (not the public Usuario table).
  const ids = [...porUsuario.keys()];
  const filas = await prisma.$queryRaw<{ id: string; email: string }[]>`
    SELECT id::text, email FROM auth.users WHERE id = ANY(${ids}::uuid[])`;
  const emailPorId = new Map(filas.map((r) => [r.id, r.email]));

  let correosEnviados = 0;

  for (const [usuarioId, misAlertas] of porUsuario) {
    const email = emailPorId.get(usuarioId);
    if (!email) continue;

    const bloques: string[] = [];
    for (const a of misAlertas) {
      const matches = await coincidencias(a.seccion, a.filtros, desde);
      if (matches.length === 0) continue;
      const d = describeAlerta(a.seccion, a.filtros);
      const resumen = d.partes.length
        ? `${d.seccion} · ${d.partes.join(" · ")}`
        : d.seccion;
      bloques.push(bloqueHtml(resumen, matches));
    }

    if (bloques.length === 0) continue; // nothing new for this user this week

    const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;color:#111;margin:0 0 4px">Novedades para ti</h1>
      <p style="color:#666;font-size:14px;margin:0 0 24px">Anuncios nuevos de esta semana que encajan con tus alertas de Bellezista.</p>
      ${bloques.join("")}
      <p style="color:#999;font-size:12px;border-top:1px solid #eee;padding-top:16px;margin-top:8px">Gestiona o borra tus alertas desde tu perfil en <a href="${SITE_URL}/perfil" style="color:#cda306">bellezista.com</a>.</p>
    </div>`;

    const ok = await enviarEmail(
      email,
      "Novedades que encajan con tus alertas · Bellezista",
      html,
    );
    if (ok) correosEnviados += 1;
  }

  return { usuarios: porUsuario.size, correosEnviados };
}
