import type { TipoAnuncio } from "@generated/prisma/enums";

// Paid "destacado" tariffs per listing type (tarifas cerradas por el cliente).
// Importes en céntimos (Stripe).
export const DESTACADO_PRECIOS: Record<
  TipoAnuncio,
  { importe: number; dias: number; nombre: string }
> = {
  MAQUINARIA: { importe: 990, dias: 7, nombre: "Destacar anuncio 7 días" },
  TRASPASO: { importe: 2900, dias: 30, nombre: "Destacar anuncio 30 días" },
};

export const MONEDA_DESTACADO = "eur";
