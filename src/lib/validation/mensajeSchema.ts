import { z } from "zod";

export const mensajeSchema = z.object({
  texto: z
    .string()
    .min(1, "Escribí un mensaje antes de enviarlo.")
    .max(2000, "El mensaje es demasiado largo."),
});

export type MensajeInput = z.infer<typeof mensajeSchema>;
