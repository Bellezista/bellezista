import "server-only";
import { prisma } from "@/lib/prisma/client";
import { TipoAnuncio } from "@generated/prisma/enums";

export interface LineaResumen {
  texto: string;
  destacado: string; // the bold lead-in
}

// Auto-generated "Resumen Diario Bellezista": a snapshot of recent real activity
// on the platform, built from the database with no manual writing. Only includes
// lines that actually have data, so it's honest even when the platform is quiet.
export async function getResumenDiario(): Promise<LineaResumen[]> {
  const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [ultimoTraspaso, maquinariaNuevas, cvsNuevos, destacados, aperturaReciente] =
    await Promise.all([
      prisma.anuncio.findFirst({
        where: { tipo: TipoAnuncio.TRASPASO, estado: "ACTIVO" },
        orderBy: { creadoEn: "desc" },
        select: { ciudadProvincia: true, creadoEn: true },
      }),
      prisma.anuncio.count({
        where: {
          tipo: TipoAnuncio.MAQUINARIA,
          estado: "ACTIVO",
          creadoEn: { gte: desde },
        },
      }),
      prisma.cv.count({ where: { visible: true, creadoEn: { gte: desde } } }),
      prisma.anuncio.count({ where: { destacadoHasta: { gt: new Date() } } }),
      prisma.anuncio.findFirst({
        where: { tipo: TipoAnuncio.TRASPASO, estado: "ACTIVO", creadoEn: { gte: desde } },
        orderBy: { creadoEn: "desc" },
        select: { ciudadProvincia: true },
      }),
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
        maquinariaNuevas === 1 ? "Nueva maquinaria" : `${maquinariaNuevas} equipos nuevos`,
      texto: " disponibles para profesionales.",
    });
  }
  if (cvsNuevos > 0) {
    lineas.push({
      destacado: cvsNuevos === 1 ? "Nuevo perfil" : `${cvsNuevos} nuevos perfiles`,
      texto: " de talento en Empleo & Talento.",
    });
  }
  if (destacados > 0) {
    lineas.push({
      destacado: destacados === 1 ? "Un anuncio destacado" : `${destacados} anuncios destacados`,
      texto: " ahora mismo en la plataforma.",
    });
  }
  if (aperturaReciente && lineas.length < 5) {
    lineas.push({
      destacado: "Nueva actividad",
      texto: " en el sector esta semana.",
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
