// Talento access packs (tarifas cerradas por el cliente). No single-CV unlock
// and no "bono de 10" any more -- replaced by these four packs. Importes en
// céntimos (Stripe).
//
// - INICIO: a bundle of 5 unlock credits (permanent access to each CV unlocked).
// - M3 / M6 / ANUAL: unlimited access to any CV during the period.
export type TalentoPackTipo = "creditos" | "periodo";

export interface TalentoPack {
  id: string;
  tipo: TalentoPackTipo;
  importe: number;
  moneda: "eur";
  nombre: string;
  descripcion: string;
  creditos?: number; // for "creditos" packs
  meses?: number; // for "periodo" packs
}

export const TALENTO_PACKS: Record<string, TalentoPack> = {
  INICIO: {
    id: "INICIO",
    tipo: "creditos",
    importe: 2900, // 29 €
    moneda: "eur",
    creditos: 5,
    nombre: "Pack Inicio",
    descripcion: "5 CVs para desbloquear.",
  },
  M3: {
    id: "M3",
    tipo: "periodo",
    importe: 8900, // 89 €
    moneda: "eur",
    meses: 3,
    nombre: "Pack 3 meses",
    descripcion: "CVs ilimitados durante 3 meses.",
  },
  M6: {
    id: "M6",
    tipo: "periodo",
    importe: 14900, // 149 €
    moneda: "eur",
    meses: 6,
    nombre: "Pack 6 meses",
    descripcion: "CVs ilimitados durante 6 meses.",
  },
  ANUAL: {
    id: "ANUAL",
    tipo: "periodo",
    importe: 24900, // 249 €
    moneda: "eur",
    meses: 12,
    nombre: "Pack Anual",
    descripcion: "CVs ilimitados durante 12 meses.",
  },
};

// Ordered list for display.
export const TALENTO_PACKS_LISTA: TalentoPack[] = [
  TALENTO_PACKS.INICIO,
  TALENTO_PACKS.M3,
  TALENTO_PACKS.M6,
  TALENTO_PACKS.ANUAL,
];

export const MONEDA_TALENTO = "eur";

export function formatearImporte(centimos: number, moneda = "eur"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: moneda.toUpperCase(),
  }).format(centimos / 100);
}
