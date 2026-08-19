import type { PlanPro } from "@generated/prisma/enums";

// Professional subscription plans for Traspasos (tarifas cerradas por el
// cliente). Importe en céntimos, mensual. limite = max active traspaso listings
// (null = unlimited).
export const PLANES_PRO: Record<
  PlanPro,
  { nombre: string; importe: number; limite: number | null; descripcion: string }
> = {
  BASICO: {
    nombre: "Básico",
    importe: 3900, // 39 €/mes
    limite: 5,
    descripcion: "Hasta 5 anuncios activos a la vez.",
  },
  PROFESIONAL: {
    nombre: "Profesional",
    importe: 7900, // 79 €/mes
    limite: 15,
    descripcion: "Hasta 15 anuncios activos a la vez.",
  },
  ILIMITADO: {
    nombre: "Ilimitado",
    importe: 14900, // 149 €/mes
    limite: null,
    descripcion: "Anuncios ilimitados.",
  },
};

export const MONEDA_PLAN = "eur";

// Free tier: a particular sells their own business, so one active traspaso.
export const FREE_LIMIT_TRASPASOS = 1;

export const ORDEN_PLANES: PlanPro[] = ["BASICO", "PROFESIONAL", "ILIMITADO"];
