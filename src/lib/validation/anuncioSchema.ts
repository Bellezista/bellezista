import { z } from "zod";

// Common Anuncio fields (CLAUDE.md "Anuncio (common fields)"). Shared by the
// publish wizard's client-side step validation AND the Server Action's
// server-side re-validation -- one schema, never duplicated/drifted.
export const anuncioComunSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres.").max(120),
  precio: z.coerce.number().positive("El precio debe ser mayor que 0."),
  ciudadProvincia: z.string().min(2, "Indicá la ciudad o provincia."),
});

export type AnuncioComunInput = z.infer<typeof anuncioComunSchema>;
