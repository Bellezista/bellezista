import { z } from "zod";
import {
  PuestoTalento,
  JornadaTalento,
  DisponibilidadTalento,
} from "@generated/prisma/enums";

// One declared technique within the puesto's block: its presence means the
// worker knows it; anios = years of experience with it.
export const cvTecnicaSchema = z.object({
  key: z.string().min(1),
  anios: z.coerce.number().int().min(0).max(70).default(0),
});

// Standardized CV fields (Talento) — client spec CV_Estandar_Talento_Bellezista.
export const cvSchema = z.object({
  puesto: z.enum(PuestoTalento),
  provincia: z.string().min(2, "Indica tu provincia."),
  aniosExperiencia: z.coerce
    .number()
    .int()
    .min(0, "Indica tus años de experiencia."),
  jornada: z.enum(JornadaTalento).default(JornadaTalento.POR_HORAS),
  disponibilidad: z
    .enum(DisponibilidadTalento)
    .default(DisponibilidadTalento.A_CONVENIR),
  expectativaSalarial: z.string().max(80).optional(),
  titulacion: z.string().max(500).optional(),
  cursos: z.string().max(500).optional(),
  presentacion: z.string().max(300, "Máximo 300 caracteres.").optional(),
  foto: z.string().optional(),
  tecnicas: z.array(cvTecnicaSchema).default([]),
});

export type CvTecnicaInput = z.infer<typeof cvTecnicaSchema>;
export type CvInput = z.infer<typeof cvSchema>;
export type CvFormInput = z.input<typeof cvSchema>;
