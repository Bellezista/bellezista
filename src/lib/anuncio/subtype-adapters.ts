import type { Anuncio, Maquinaria, Traspaso } from "@generated/prisma/client";
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
  TIPO_NEGOCIO_TRASPASO_LABEL,
  TIPO_ANUNCIANTE_TRASPASO_LABEL,
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

// alquilerMensual is Decimal (server) | number (serialized), same reason as
// MaquinariaLike's beautyScore -- the adapter must work on both shapes.
type TraspasoLike = Omit<Traspaso, "alquilerMensual"> & {
  alquilerMensual: Traspaso["alquilerMensual"] | number;
};

export const traspasoAdapter: SubtypeAdapter<TraspasoLike> = {
  tipo: TipoAnuncio.TRASPASO,
  label: "Traspasos",
  // Contact via internal messaging, same as Maquinaria (not the pay-per-post
  // Oferta model).
  contactoDirecto: false,
  getAtributosCard(t) {
    const atributos: AtributoDisplay[] = [
      { label: "Negocio", value: TIPO_NEGOCIO_TRASPASO_LABEL[t.tipoNegocio] },
    ];
    if (t.metrosCuadrados != null) {
      atributos.push({ label: "Superficie", value: `${t.metrosCuadrados} m²` });
    }
    return atributos;
  },
  getAtributosFicha(t) {
    const atributos: AtributoDisplay[] = [
      {
        label: "Tipo de negocio",
        value: TIPO_NEGOCIO_TRASPASO_LABEL[t.tipoNegocio],
      },
      {
        label: "Anunciante",
        value: TIPO_ANUNCIANTE_TRASPASO_LABEL[t.tipoAnunciante],
      },
    ];
    if (t.metrosCuadrados != null) {
      atributos.push({ label: "Superficie", value: `${t.metrosCuadrados} m²` });
    }
    if (t.cabinas != null) {
      atributos.push({ label: "Cabinas", value: String(t.cabinas) });
    }
    if (t.personal != null) {
      atributos.push({ label: "Personal", value: String(t.personal) });
    }
    if (t.alquilerMensual != null) {
      atributos.push({
        label: "Alquiler mensual",
        value: `${Number(t.alquilerMensual).toLocaleString("es-ES")} €`,
      });
    }
    atributos.push({
      label: "Licencia incluida",
      value: t.incluyeLicencia ? "Sí" : "No",
    });
    return atributos;
  },
  getDescripcion(t) {
    return t.descripcion ?? null;
  },
};

// Not typed as Record<TipoAnuncio, SubtypeAdapter<unknown>> on purpose --
// each adapter's methods take its own concrete subtype as a parameter, and
// widening to `unknown` there breaks (contravariant position). Consumers
// look this up by a tipo they already know, so the concrete per-key type is
// what you want anyway.
export const subtypeAdapters = {
  [TipoAnuncio.MAQUINARIA]: maquinariaAdapter,
  [TipoAnuncio.TRASPASO]: traspasoAdapter,
  // Fase 2 remaining: [TipoAnuncio.TALENT]: ..., [TipoAnuncio.OFERTA]: ...
};

export type AnuncioConMaquinaria = Anuncio & {
  maquinaria: Maquinaria | null;
  traspaso: Traspaso | null;
};

// Subtype-agnostic dispatch helpers. AnuncioCard/AnuncioFicha call these with
// the whole anuncio (raw or serialized) and never touch a concrete subtype
// field, so adding a module is purely a new adapter above -- no card/ficha
// changes. Accepts a loose shape so both the Prisma row and the serialized
// (number) shape work.
type AnuncioSubtipoLike = {
  tipo: TipoAnuncio;
  maquinaria: MaquinariaLike | null;
  traspaso: TraspasoLike | null;
};

function subtipoDe(a: AnuncioSubtipoLike) {
  if (a.tipo === TipoAnuncio.MAQUINARIA && a.maquinaria) {
    return { adapter: maquinariaAdapter, subtipo: a.maquinaria } as const;
  }
  if (a.tipo === TipoAnuncio.TRASPASO && a.traspaso) {
    return { adapter: traspasoAdapter, subtipo: a.traspaso } as const;
  }
  return null;
}

export function atributosCardDe(a: AnuncioSubtipoLike): AtributoDisplay[] {
  const s = subtipoDe(a);
  if (!s) return [];
  return s.adapter.getAtributosCard(s.subtipo as never);
}

export function atributosFichaDe(a: AnuncioSubtipoLike): AtributoDisplay[] {
  const s = subtipoDe(a);
  if (!s) return [];
  return s.adapter.getAtributosFicha(s.subtipo as never);
}

export function descripcionDe(a: AnuncioSubtipoLike): string | null {
  const s = subtipoDe(a);
  if (!s) return null;
  return s.adapter.getDescripcion(s.subtipo as never);
}

// Small "eyebrow"/category label per subtype: Maquinaria -> categoría,
// Traspaso -> tipo de negocio. Returns null if no subtype row is present.
export function categoriaLabelDe(a: AnuncioSubtipoLike): string | null {
  if (a.tipo === TipoAnuncio.MAQUINARIA && a.maquinaria) {
    return CATEGORIA_MAQUINARIA_LABEL[a.maquinaria.categoria];
  }
  if (a.tipo === TipoAnuncio.TRASPASO && a.traspaso) {
    return TIPO_NEGOCIO_TRASPASO_LABEL[a.traspaso.tipoNegocio];
  }
  return null;
}
