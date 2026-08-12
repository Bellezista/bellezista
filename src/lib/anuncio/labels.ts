// Type-only: SWC/Turbopack transpile per-file without cross-file type info,
// so only an explicit `import type` is guaranteed to be elided from the
// client bundle -- these four are never used as runtime values here.
import type {
  CategoriaMaquinaria,
  EstadoEquipo,
  EstadoAnuncio,
  NivelServicio,
  TipoNegocioTraspaso,
  TipoAnuncianteTraspaso,
  PuestoTalento,
  JornadaTalento,
  DisponibilidadTalento,
} from "@generated/prisma/client";

// Display labels in the exact Spanish wording from the client's brief
// (CLAUDE.md section "Data model") -- the Prisma enums themselves use
// upper_snake_case for storage, these map back to the human-facing text.

export const CATEGORIA_MAQUINARIA_LABEL: Record<CategoriaMaquinaria, string> =
  {
    APARATOLOGIA: "Aparatología",
    MOBILIARIO: "Mobiliario",
    EQUIPAMIENTO: "Equipamiento",
  };

export const ESTADO_EQUIPO_LABEL: Record<EstadoEquipo, string> = {
  NUEVO: "Nuevo",
  COMO_NUEVO: "Como nuevo",
  BUEN_ESTADO: "Buen estado",
  REQUIERE_REVISION: "Requiere revisión",
};

export const NIVEL_SERVICIO_LABEL: Record<NivelServicio, string> = {
  BASICO: "Básico",
  VENTA_PROTEGIDA: "Venta Protegida",
  VENTA_PREMIUM: "Venta Premium",
};

export const ESTADO_ANUNCIO_LABEL: Record<EstadoAnuncio, string> = {
  ACTIVO: "Activo",
  DESTACADO: "Destacado",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  RETIRADO: "Retirado",
};

export const TIPO_NEGOCIO_TRASPASO_LABEL: Record<TipoNegocioTraspaso, string> = {
  CENTRO_ESTETICA: "Centro de estética",
  PELUQUERIA: "Peluquería",
  BARBERIA: "Barbería",
  CLINICA_MEDICINA_ESTETICA: "Clínica de medicina estética",
  OTRAS_CLINICAS: "Otras clínicas",
  SALON_MANICURA: "Salón de manicura",
  SALON_MASAJES: "Salón de masajes",
  SALON_BELLEZA: "Salón de belleza",
  OTROS: "Otros",
};

export const TIPO_ANUNCIANTE_TRASPASO_LABEL: Record<
  TipoAnuncianteTraspaso,
  string
> = {
  PARTICULAR: "Particular",
  PROFESIONAL: "Profesional",
  INMOBILIARIA: "Inmobiliaria",
};

export const PUESTO_TALENTO_LABEL: Record<PuestoTalento, string> = {
  ESTETICISTA: "Esteticista",
  PELUQUERO: "Peluquero/a",
  BARBERO: "Barbero/a",
  MANICURISTA: "Manicurista",
  MAQUILLADOR: "Maquillador/a",
  MASAJISTA: "Masajista",
  RECEPCIONISTA: "Recepcionista",
  OTROS: "Otros",
};

export const JORNADA_TALENTO_LABEL: Record<JornadaTalento, string> = {
  COMPLETA: "Jornada completa",
  PARCIAL: "Media jornada",
  POR_HORAS: "Por horas",
};

export const DISPONIBILIDAD_TALENTO_LABEL: Record<
  DisponibilidadTalento,
  string
> = {
  INMEDIATA: "Inmediata",
  CON_PREAVISO: "Con preaviso",
  FINES_DE_SEMANA: "Fines de semana",
  A_CONVENIR: "A convenir",
};
