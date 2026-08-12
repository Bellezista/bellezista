import type { Cv } from "@generated/prisma/client";

export interface TalentoFiltros {
  puesto?: string;
  provincia?: string;
  q?: string;
}

// Public teaser shown in the Talento catalog. Name and full profile/contact
// are gated behind the pay-to-access paywall, so they are NOT in this shape.
export type CvResumen = Pick<
  Cv,
  | "id"
  | "puesto"
  | "provincia"
  | "aniosExperiencia"
  | "jornada"
  | "disponibilidad"
  | "foto"
>;
