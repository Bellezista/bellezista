import type { Anuncio, Maquinaria } from "@generated/prisma/client";
// Value import from the pure-data enums module, not @generated/prisma/client
// -- this file (no "use client"/"use server" directive of its own) gets
// bundled into whatever imports it, including Server Components that are
// themselves pulled into a client chunk (e.g. AnuncioCard rendered from a
// "use client" parent) -- @generated/prisma/client also contains the
// PrismaClient runtime (Node-only internals), which breaks that bundle.
import { TipoAnuncio } from "@generated/prisma/enums";
import {
  CATEGORIA_MAQUINARIA_LABEL,
  ESTADO_EQUIPO_LABEL,
} from "./labels";

// The reusable-component pattern the bid was won on: one card, one ficha, and
// one publish stepper, all driven by an adapter per subtype -- never
// hardcoding Maquinaria field names. Adding Traspasos/Talent/Oferta in Fase 2
// means: a new 1:1 subtype table (see prisma/schema), a new adapter object
// here, and new step components -- zero changes to AnuncioCard, AnuncioFicha,
// FichaContactoCard, or PublishStepper.

export interface AtributoDisplay {
  label: string;
  value: string;
}

export interface SubtypeAdapter<TSubtype> {
  tipo: TipoAnuncio;
  label: string;
  // false for Maquinaria/Traspasos (contact only via internal messaging).
  // Fase 2's Oferta destacada subtype sets this true -- different revenue
  // model (pay-per-post, not commission), see CLAUDE.md section 4.3.
  contactoDirecto: boolean;
  getAtributosCard: (subtipo: TSubtype) => AtributoDisplay[];
  getAtributosFicha: (subtipo: TSubtype) => AtributoDisplay[];
  getDescripcion: (subtipo: TSubtype) => string | null;
}

// beautyScore is typed loosely (Decimal | number) so this adapter works
// against both the raw Prisma shape (server-side) and the serialized shape
// passed into Client Components (see src/types/anuncio.ts -- Prisma's
// Decimal can't cross that boundary as a prop). Nothing here actually reads
// beautyScore yet, but the parameter type is checked structurally either way.
type MaquinariaLike = Omit<Maquinaria, "beautyScore"> & {
  beautyScore: Maquinaria["beautyScore"] | number;
};

export const maquinariaAdapter: SubtypeAdapter<MaquinariaLike> = {
  tipo: TipoAnuncio.MAQUINARIA,
  label: "Maquinaria",
  contactoDirecto: false,
  getAtributosCard(m) {
    return [
      { label: "Marca", value: m.marca },
      { label: "Estado", value: ESTADO_EQUIPO_LABEL[m.estadoEquipo] },
    ];
  },
  getAtributosFicha(m) {
    const atributos: AtributoDisplay[] = [
      { label: "Categoría", value: CATEGORIA_MAQUINARIA_LABEL[m.categoria] },
      { label: "Marca", value: m.marca },
      { label: "Modelo", value: m.modelo },
      { label: "Estado del equipo", value: ESTADO_EQUIPO_LABEL[m.estadoEquipo] },
    ];
    if (m.subcategoria) {
      atributos.push({ label: "Subcategoría", value: m.subcategoria });
    }
    if (m.anio != null) {
      atributos.push({ label: "Año", value: String(m.anio) });
    }
    if (m.horasDeUso != null) {
      atributos.push({ label: "Horas de uso", value: String(m.horasDeUso) });
    }
    if (m.esMedicoEstetico) {
      atributos.push({ label: "Médico-estético", value: "Sí" });
    }
    return atributos;
  },
  getDescripcion(m) {
    return m.descripcion ?? null;
  },
};

// Not typed as Record<TipoAnuncio, SubtypeAdapter<unknown>> on purpose --
// each adapter's methods take its own concrete subtype as a parameter, and
// widening to `unknown` there breaks (contravariant position). Consumers
// look this up by a tipo they already know, so the concrete per-key type is
// what you want anyway.
export const subtypeAdapters = {
  [TipoAnuncio.MAQUINARIA]: maquinariaAdapter,
  // Fase 2: [TipoAnuncio.TRASPASO]: traspasoAdapter, [TipoAnuncio.TALENT]: ..., [TipoAnuncio.OFERTA]: ...
};

export type AnuncioConMaquinaria = Anuncio & { maquinaria: Maquinaria | null };
