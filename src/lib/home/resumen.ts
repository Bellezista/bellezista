import "server-only";
import { prisma } from "@/lib/prisma/client";
import { TipoAnuncio } from "@generated/prisma/enums";

export interface LineaResumen {
  texto: string;
  destacado: string; // the bold lead-in
}

// Auto-generated "Resumen Diario Bellezista": a snapshot of recent real activity
// on the platform, built from the database with no manual writing. Only lines
// with actual data are included, so it stays honest even when the platform is
// quiet.
//
// Event types whose module does not exist yet are intentionally NOT faked and
// will be wired when their data source lands:
//   - Nueva oferta de empleo (no job-vacancy model; `Oferta` is a promo)
//   - Nuevo proveedor en Profesionales (directory is still a placeholder)
//   - Profesional destacado Premium (depends on the Profesionales directory)
export async function getResumenDiario(): Promise<LineaResumen[]> {
  const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [ultimoTraspaso, maquinariaNuevas, cvsNuevos, miembrosNuevos] =
    await Promise.all([
      prisma.anuncio.findFirst({
        where: {
          tipo: TipoAnuncio.TRASPASO,
          estado: "ACTIVO",
          creadoEn: { gte: desde },
        },
        orderBy: { creadoEn: "desc" },
        select: { ciudadProvincia: true },
      }),
      prisma.anuncio.count({
        where: {
          tipo: TipoAnuncio.MAQUINARIA,
          estado: "ACTIVO",
          creadoEn: { gte: desde },
        },
      }),
      prisma.cv.count({ where: { visible: true, creadoEn: { gte: desde } } }),
      prisma.usuario.count({ where: { creadoEn: { gte: desde } } }),
    ]);

  const lineas: LineaResumen[] = [];

  if (ultimoTraspaso) {
    lineas.push({
      destacado: "Nuevo traspaso",
      texto: ` publicado${ultimoTraspaso.ciudadProvincia ? ` en ${ultimoTraspaso.ciudadProvincia}` : ""}.`,
    });
  }
  if (maquinariaNuevas > 0) {
    lineas.push({
      destacado:
        maquinariaNuevas === 1
          ? "Nueva maquinaria"
          : `${maquinariaNuevas} equipos nuevos`,
      texto:
        maquinariaNuevas === 1
          ? " disponible para profesionales."
          : " disponibles para profesionales.",
    });
  }
  if (cvsNuevos > 0) {
    lineas.push({
      destacado:
        cvsNuevos === 1 ? "Nuevo perfil de talento" : `${cvsNuevos} nuevos perfiles`,
      texto:
        cvsNuevos === 1
          ? " en Empleo & Talento."
          : " de talento en Empleo & Talento.",
    });
  }
  if (miembrosNuevos > 0) {
    lineas.push({
      destacado:
        miembrosNuevos === 1
          ? "Un nuevo profesional"
          : `${miembrosNuevos} nuevos profesionales`,
      texto:
        miembrosNuevos === 1
          ? " se ha unido a Bellezista esta semana."
          : " se han unido a Bellezista esta semana.",
    });
  }

  if (lineas.length === 0) {
    lineas.push({
      destacado: "Todo listo",
      texto: " la actividad del sector aparecerá aquí a diario.",
    });
  }

  return lineas.slice(0, 5);
}
