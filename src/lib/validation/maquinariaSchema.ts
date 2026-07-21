import { z } from "zod";
// Pure-data enums module, not @generated/prisma/client -- this schema is
// imported by client components (the publish wizard), and @generated/prisma/client
// also contains the PrismaClient runtime (Node-only internals), which breaks
// the client bundle if pulled in by value.
import {
  CategoriaMaquinaria,
  EstadoEquipo,
  NivelServicio,
} from "@generated/prisma/enums";

// Maquinaria subtype fields (CLAUDE.md "Maquinaria (Etapa 1 subtype-specific
// fields)"). Shared by the publish wizard's step 2 AND the Server Action.
export const maquinariaSchema = z.object({
  categoria: z.enum(CategoriaMaquinaria),
  subcategoria: z.string().max(80).optional(),
  marca: z.string().min(1, "Indicá la marca."),
  modelo: z.string().min(1, "Indicá el modelo."),
  numeroSerie: z.string().max(80).optional(),
  descripcion: z.string().max(4000).optional(),
  anio: z.coerce.number().int().min(1980).max(2100).optional(),
  horasDeUso: z.coerce.number().int().min(0).optional(),
  beautyScore: z.coerce.number().min(0).max(10).optional(),
  estadoEquipo: z.enum(EstadoEquipo),
  nivelDeServicio: z.enum(NivelServicio).default(NivelServicio.BASICO),
  esMedicoEstetico: z.coerce.boolean().default(false),
  fechaPuestaEnMarcha: z.coerce.date().optional(),
});

export type MaquinariaInput = z.infer<typeof maquinariaSchema>;
