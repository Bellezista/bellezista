import { z } from "zod";
import { anuncioComunSchema } from "./anuncioSchema";
import { maquinariaSchema } from "./maquinariaSchema";

// The full "publish a Maquinaria listing" schema -- the wizard's steps each
// validate a subset of this client-side (anuncioComunSchema for step 2's
// shared fields, maquinariaSchema for step 2's type-specific fields), and the
// Server Action re-validates this exact merged schema server-side, so the
// two can never drift apart.
export const publicarMaquinariaSchema = anuncioComunSchema
  .extend(maquinariaSchema.shape)
  .extend({
    fotos: z.array(z.string()).min(1, "Subí al menos una foto."),
    video: z.string().optional(),
    factura: z.string().optional(),
    // No user-facing contact-visibility choice: phone/email are never shown
    // directly, under any circumstance -- that's the non-negotiable security
    // requirement, not a per-listing setting. Contact always goes through
    // internal messaging (see FichaContactoCard).
  });

// z.coerce.number()/z.coerce.boolean() (used for precio, esMedicoEstetico,
// anio, etc.) give this schema a different INPUT shape (what the raw <input>
// fields hold, e.g. precio as a string) than its OUTPUT shape (precio as a
// number, after Zod coerces it). react-hook-form's useForm needs the input
// shape for TFieldValues (what register/watch/trigger operate on) and the
// output shape for the final submit handler's argument -- see PublishStepper.
export type PublicarMaquinariaInput = z.infer<typeof publicarMaquinariaSchema>;
export type PublicarMaquinariaFormInput = z.input<
  typeof publicarMaquinariaSchema
>;
