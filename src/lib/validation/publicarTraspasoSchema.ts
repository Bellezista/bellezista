import { z } from "zod";
import { anuncioComunSchema } from "./anuncioSchema";
import { traspasoSchema } from "./traspasoSchema";

// Full "publish a Traspaso listing" schema. Same shape as the Maquinaria one:
// the wizard validates subsets client-side, the Server Action re-validates
// this exact merged schema server-side, so they can't drift.
export const publicarTraspasoSchema = anuncioComunSchema
  .extend(traspasoSchema.shape)
  .extend({
    fotos: z.array(z.string()).min(1, "Sube al menos una foto."),
    // Same platform-wide terms checkbox as Maquinaria's final step.
    aceptaCondiciones: z.coerce
      .boolean()
      .refine(
        (v) => v === true,
        "Debes aceptar las condiciones de publicación.",
      ),
  });

export type PublicarTraspasoInput = z.infer<typeof publicarTraspasoSchema>;
export type PublicarTraspasoFormInput = z.input<typeof publicarTraspasoSchema>;
