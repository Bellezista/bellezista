import { z } from "zod";
import {
  PuestoTalento,
  JornadaTalento,
  DisponibilidadTalento,
} from "@generated/prisma/enums";

// Standardized CV fields (Talento). Proposed set -- confirm with the client.
export const cvSchema = z.object({
  puesto: z.enum(PuestoTalento),
  provincia: z.string().min(2, "Indica tu provincia."),
  aniosExperiencia: z.coerce
    .number()
    .int()
    .min(0, "Indica tus años de experiencia."),
  jornada: z.enum(JornadaTalento).default(JornadaTalento.INDIFERENTE),
  disponibilidad: z
    .enum(DisponibilidadTalento)
    .default(DisponibilidadTalento.A_CONVENIR),
  formacion: z.string().max(500).optional(),
  habilidades: z.string().max(500).optional(),
  presentacion: z.string().max(2000).optional(),
  foto: z.string().optional(),
});

export type CvInput = z.infer<typeof cvSchema>;
export type CvFormInput = z.input<typeof cvSchema>;
