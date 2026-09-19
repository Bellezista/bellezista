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

// ---------------------------------------------------------------------------
// Actualidad feeds: real per-day and per-period activity, aggregated from
// creadoEn timestamps (no manual writing, no stored snapshots).

export interface DiaResumen {
  fecha: string; // ISO date (yyyy-mm-dd)
  lineas: LineaResumen[];
}

function lineasDeActividad(a: {
  traspasos: number;
  traspasoCiudad?: string | null;
  maquinaria: number;
  cvs: number;
  miembros: number;
}): LineaResumen[] {
  const lineas: LineaResumen[] = [];
  if (a.traspasos > 0) {
    lineas.push({
      destacado: a.traspasos === 1 ? "Nuevo traspaso" : `${a.traspasos} traspasos`,
      texto:
        a.traspasos === 1
          ? ` publicado${a.traspasoCiudad ? ` en ${a.traspasoCiudad}` : ""}.`
          : " publicados en el sector.",
    });
  }
  if (a.maquinaria > 0) {
    lineas.push({
      destacado:
        a.maquinaria === 1 ? "Nueva maquinaria" : `${a.maquinaria} equipos nuevos`,
      texto: a.maquinaria === 1 ? " disponible." : " disponibles.",
    });
  }
  if (a.cvs > 0) {
    lineas.push({
      destacado: a.cvs === 1 ? "Nuevo perfil de talento" : `${a.cvs} nuevos perfiles`,
      texto: " en Empleo & Talento.",
    });
  }
  if (a.miembros > 0) {
    lineas.push({
      destacado:
        a.miembros === 1 ? "Un nuevo profesional" : `${a.miembros} nuevos profesionales`,
      texto: a.miembros === 1 ? " se unió a Bellezista." : " se unieron a Bellezista.",
    });
  }
  return lineas;
}

// One card per day with activity, for the last `dias` days (most recent first).
export async function getResumenDiarioFeed(dias = 10): Promise<DiaResumen[]> {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  desde.setDate(desde.getDate() - (dias - 1));

  const [traspasos, maquinaria, cvs, usuarios] = await Promise.all([
    prisma.anuncio.findMany({
      where: { tipo: TipoAnuncio.TRASPASO, estado: "ACTIVO", creadoEn: { gte: desde } },
      select: { creadoEn: true, ciudadProvincia: true },
    }),
    prisma.anuncio.findMany({
      where: { tipo: TipoAnuncio.MAQUINARIA, estado: "ACTIVO", creadoEn: { gte: desde } },
      select: { creadoEn: true },
    }),
    prisma.cv.findMany({ where: { visible: true, creadoEn: { gte: desde } }, select: { creadoEn: true } }),
    prisma.usuario.findMany({ where: { creadoEn: { gte: desde } }, select: { creadoEn: true } }),
  ]);

  const key = (d: Date) => new Date(d).toISOString().slice(0, 10);
  type Bucket = { traspasos: number; traspasoCiudad?: string | null; maquinaria: number; cvs: number; miembros: number };
  const map = new Map<string, Bucket>();
  const get = (k: string): Bucket => {
    let b = map.get(k);
    if (!b) {
      b = { traspasos: 0, maquinaria: 0, cvs: 0, miembros: 0 };
      map.set(k, b);
    }
    return b;
  };

  for (const t of traspasos) {
    const b = get(key(t.creadoEn));
    b.traspasos += 1;
    if (!b.traspasoCiudad) b.traspasoCiudad = t.ciudadProvincia;
  }
  for (const m of maquinaria) get(key(m.creadoEn)).maquinaria += 1;
  for (const c of cvs) get(key(c.creadoEn)).cvs += 1;
  for (const u of usuarios) get(key(u.creadoEn)).miembros += 1;

  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([fecha, b]) => ({ fecha, lineas: lineasDeActividad(b) }))
    .filter((d) => d.lineas.length > 0);
}

// Aggregated summary for the last `dias` days (period feed, e.g. monthly).
export async function getResumenPeriodo(dias = 30): Promise<LineaResumen[]> {
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const [traspasos, maquinaria, cvs, miembros] = await Promise.all([
    prisma.anuncio.count({ where: { tipo: TipoAnuncio.TRASPASO, estado: "ACTIVO", creadoEn: { gte: desde } } }),
    prisma.anuncio.count({ where: { tipo: TipoAnuncio.MAQUINARIA, estado: "ACTIVO", creadoEn: { gte: desde } } }),
    prisma.cv.count({ where: { visible: true, creadoEn: { gte: desde } } }),
    prisma.usuario.count({ where: { creadoEn: { gte: desde } } }),
  ]);
  return lineasDeActividad({ traspasos, maquinaria, cvs, miembros });
}
