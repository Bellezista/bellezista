import { TipoNegocioTraspaso } from "@generated/prisma/enums";

// Which specific fields a traspaso asks for, depending on the type of business.
// Same idea as the Talento técnicas-per-puesto checklist: the form and the ficha
// read this map so each business type shows only the fields that matter to a
// buyer (a peluquería asks tocadores/lavacabezas, not "cabinas"). Field `key`
// matches the Prisma/Zod field name exactly.
export interface CampoNegocio {
  key: string;
  label: string;
  tipo: "number" | "boolean";
}

const ESTETICA_CLINICA: CampoNegocio[] = [
  { key: "cabinas", label: "Número de cabinas", tipo: "number" },
  { key: "lavamanosPorCabina", label: "¿Tiene lavamanos en cada cabina?", tipo: "boolean" },
];

export const CAMPOS_POR_NEGOCIO: Record<TipoNegocioTraspaso, CampoNegocio[]> = {
  PELUQUERIA: [
    { key: "tocadores", label: "Número de tocadores", tipo: "number" },
    { key: "lavacabezas", label: "Número de lavacabezas", tipo: "number" },
    { key: "cabinas", label: "Cabinas (opcional)", tipo: "number" },
  ],
  BARBERIA: [
    { key: "sillonesBarberia", label: "Sillones de barbería", tipo: "number" },
    { key: "lavacabezas", label: "Número de lavacabezas", tipo: "number" },
    { key: "cabinas", label: "Cabinas (opcional)", tipo: "number" },
  ],
  SALON_MANICURA: [
    { key: "puestosManicura", label: "Puestos de manicura", tipo: "number" },
    { key: "puestosPedicura", label: "Puestos de pedicura", tipo: "number" },
    { key: "cabinas", label: "Cabinas (opcional)", tipo: "number" },
  ],
  CENTRO_ESTETICA: ESTETICA_CLINICA,
  CLINICA_MEDICINA_ESTETICA: ESTETICA_CLINICA,
  OTRAS_CLINICAS: ESTETICA_CLINICA,
  SALON_MASAJES: [
    { key: "cabinas", label: "Número de cabinas", tipo: "number" },
    { key: "tieneDucha", label: "¿Tiene ducha?", tipo: "boolean" },
  ],
  SALON_BELLEZA: [
    { key: "cabinas", label: "Número de cabinas", tipo: "number" },
    { key: "tocadores", label: "Tocadores de peluquería", tipo: "number" },
    { key: "lavacabezas", label: "Número de lavacabezas", tipo: "number" },
    { key: "puestosManicura", label: "Puestos de manicura (opcional)", tipo: "number" },
    { key: "puestosPedicura", label: "Puestos de pedicura (opcional)", tipo: "number" },
  ],
  OTROS: [
    { key: "puestosTrabajo", label: "Número de puestos de trabajo", tipo: "number" },
  ],
};

// Short labels for showing the fields on the ficha (any type).
export const CAMPO_NEGOCIO_LABEL: Record<string, string> = {
  cabinas: "Cabinas",
  tocadores: "Tocadores",
  lavacabezas: "Lavacabezas",
  sillonesBarberia: "Sillones de barbería",
  puestosManicura: "Puestos de manicura",
  puestosPedicura: "Puestos de pedicura",
  puestosTrabajo: "Puestos de trabajo",
  lavamanosPorCabina: "Lavamanos en cada cabina",
  tieneDucha: "Ducha",
};

// Ordered list of every per-business field, for the ficha to render whatever has
// a value regardless of the current type.
export const CAMPOS_NEGOCIO_TODOS: CampoNegocio[] = [
  { key: "cabinas", label: "Cabinas", tipo: "number" },
  { key: "tocadores", label: "Tocadores", tipo: "number" },
  { key: "lavacabezas", label: "Lavacabezas", tipo: "number" },
  { key: "sillonesBarberia", label: "Sillones de barbería", tipo: "number" },
  { key: "puestosManicura", label: "Puestos de manicura", tipo: "number" },
  { key: "puestosPedicura", label: "Puestos de pedicura", tipo: "number" },
  { key: "puestosTrabajo", label: "Puestos de trabajo", tipo: "number" },
  { key: "lavamanosPorCabina", label: "Lavamanos en cada cabina", tipo: "boolean" },
  { key: "tieneDucha", label: "Ducha", tipo: "boolean" },
];
