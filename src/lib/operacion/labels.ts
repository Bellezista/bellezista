import type { EstadoOperacion } from "@generated/prisma/enums";

// Human-facing label + tone for each operation state, shared by the buyer and
// seller views.
export const ESTADO_OPERACION_LABEL: Record<EstadoOperacion, string> = {
  PENDIENTE_DE_PAGO: "Pendiente de pago",
  PAGADO_EN_REVISION: "Pagado · en revisión",
  LIBERADO: "Completado",
  INCIDENCIA_ABIERTA: "Incidencia abierta",
  REEMBOLSADO: "Reembolsado",
  CANCELADO: "Cancelado",
};

export type TonoEstado = "neutro" | "activo" | "exito" | "alerta";

export const ESTADO_OPERACION_TONO: Record<EstadoOperacion, TonoEstado> = {
  PENDIENTE_DE_PAGO: "neutro",
  PAGADO_EN_REVISION: "activo",
  LIBERADO: "exito",
  INCIDENCIA_ABIERTA: "alerta",
  REEMBOLSADO: "neutro",
  CANCELADO: "neutro",
};
