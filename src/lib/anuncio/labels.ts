// Type-only: SWC/Turbopack transpile per-file without cross-file type info,
// so only an explicit `import type` is guaranteed to be elided from the
// client bundle -- these four are never used as runtime values here.
import type {
  CategoriaMaquinaria,
  EstadoEquipo,
  EstadoAnuncio,
  NivelServicio,
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
