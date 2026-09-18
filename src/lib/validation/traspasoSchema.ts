import { z } from "zod";
// Pure-data enums module, not @generated/prisma/client -- imported by the
// client-side wizard; the full client would drag PrismaClient into the bundle.
import {
  TipoNegocioTraspaso,
  TipoAnuncianteTraspaso,
  TipoLicenciaTraspaso,
} from "@generated/prisma/enums";

// Empty number inputs arrive as "" or NaN (react-hook-form valueAsNumber);
// treat both as "not provided" so an optional field stays undefined rather
// than being coerced to 0.
const numeroOpcional = (base: z.ZodType<number>) =>
  z.preprocess(
    (v) => (v === "" || v == null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
    base.optional(),
  );

// Traspaso subtype fields. Shared by the publish wizard's step 2 AND the
// Server Action, same one-schema pattern as maquinariaSchema.
export const traspasoSchema = z.object({
  tipoNegocio: z.enum(TipoNegocioTraspaso),
  tipoAnunciante: z
    .enum(TipoAnuncianteTraspaso)
    .default(TipoAnuncianteTraspaso.PARTICULAR),
  descripcion: z.string().max(4000).optional(),
  metrosCuadrados: numeroOpcional(z.coerce.number().int().min(0)),
  cabinas: numeroOpcional(z.coerce.number().int().min(0)),
  personal: numeroOpcional(z.coerce.number().int().min(0)),
  alquilerMensual: numeroOpcional(z.coerce.number().min(0)),
  tipoLicencia: z.enum(TipoLicenciaTraspaso).optional(),

  // Business-type-specific fields (see campos-negocio.ts). All optional; the
  // form only renders the ones that apply to the chosen tipoNegocio.
  tocadores: numeroOpcional(z.coerce.number().int().min(0)),
  lavacabezas: numeroOpcional(z.coerce.number().int().min(0)),
  sillonesBarberia: numeroOpcional(z.coerce.number().int().min(0)),
  puestosManicura: numeroOpcional(z.coerce.number().int().min(0)),
  puestosPedicura: numeroOpcional(z.coerce.number().int().min(0)),
  puestosTrabajo: numeroOpcional(z.coerce.number().int().min(0)),
  lavamanosPorCabina: z.coerce.boolean().optional(),
  tieneDucha: z.coerce.boolean().optional(),

  // Universal staff fields.
  incluyePersonal: z.coerce.boolean().optional(),
  antiguedadPersonal: z.string().max(200).optional(),

  // Local characteristics (catalog filters).
  enFuncionamiento: z.coerce.boolean().optional(),
  aPieDeCalle: z.coerce.boolean().optional(),
  reformado: z.coerce.boolean().optional(),
  conClientela: z.coerce.boolean().optional(),
  conAparatologia: z.coerce.boolean().optional(),
});

export type TraspasoInput = z.infer<typeof traspasoSchema>;
