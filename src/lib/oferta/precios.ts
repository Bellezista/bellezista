import type { VigenciaOferta } from "@generated/prisma/enums";

// Pay-per-active-offer pricing (no commission on the treatment itself -- that's
// closed via WhatsApp off-platform). Amounts in cents. PLACEHOLDER values until
// the client confirms the final prices; changing them here is the only edit
// needed.
export const OFERTA_PRECIOS: Record<
  VigenciaOferta,
  { importe: number; dias: number; nombre: string }
> = {
  DIARIA: { importe: 500, dias: 1, nombre: "Oferta destacada · 1 día" },
  SEMANAL: { importe: 1500, dias: 7, nombre: "Oferta destacada · 1 semana" },
};

export const MONEDA_OFERTA = "eur";
