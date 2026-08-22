// Shared types for Anuncio-related data, deliberately kept in a plain module
// with no "use server"/"use client" directive. Client-bundled files (hooks,
// client components) must import types from HERE, never from
// src/lib/actions/*.ts -- even a type-only import of a "use server" file
// trips a Turbopack chunking error in this Next.js version (it appears to
// analyze the whole module, including its Prisma-heavy dependencies, before
// the type-only import gets erased). Server Action files import these types
// from here too, so there's exactly one definition.
import type {
  Anuncio,
  Maquinaria,
  Traspaso,
  Usuario,
} from "@generated/prisma/client";

export interface CatalogoFiltros {
  categoria?: string;
  marca?: string;
  ciudad?: string;
  q?: string;
  // Traspasos-specific filters (ignored by the Maquinaria catalog).
  tipoNegocio?: string;
  precioMin?: number;
  precioMax?: number;
}

// Named "ConMaquinaria" for historical reasons; now carries every 1:1 subtype
// (both nullable -- exactly one is set, per the row's `tipo`).
export type AnuncioConMaquinaria = Anuncio & {
  maquinaria: Maquinaria | null;
  traspaso: Traspaso | null;
};

export type AnuncioConDetallePropietario = AnuncioConMaquinaria & {
  propietario: Usuario;
};

export type MisAnuncioConDetalle = AnuncioConMaquinaria & {
  _count: { conversaciones: number };
};

// React Server Components can't pass Prisma's Decimal (precio, alquilerMensual --
// class instances, not plain objects) as a prop into a Client Component --
// confirmed live via a dev-server smoke test ("Only plain objects can be
// passed to Client Components... Decimal objects are not supported"), not
// something `tsc`/`next build` catches. Every Server Component page that
// hands Anuncio data to a "use client" component must serialize through
// serializeAnuncio()/serializeAnuncios() first; the client-side prop types
// below reflect the serialized (number) shape those functions produce.
// Maquinaria has no Decimal fields, so its serialized shape is unchanged.
type MaquinariaSerializada = Maquinaria;

type TraspasoSerializado = Omit<Traspaso, "alquilerMensual"> & {
  alquilerMensual: number | null;
};

export type AnuncioSerializado = Omit<Anuncio, "precio"> & {
  precio: number;
  // True while destacadoHasta is in the future (paid featured listing).
  destacado: boolean;
  maquinaria: MaquinariaSerializada | null;
  traspaso: TraspasoSerializado | null;
};

export type MisAnuncioSerializado = AnuncioSerializado & {
  _count: { conversaciones: number };
};

export type AnuncioConPropietarioSerializado = AnuncioSerializado & {
  propietario: { nombre: string };
};

export function serializeAnuncio(
  anuncio: AnuncioConMaquinaria,
): AnuncioSerializado {
  return {
    ...anuncio,
    precio: Number(anuncio.precio),
    destacado:
      anuncio.destacadoHasta != null &&
      anuncio.destacadoHasta.getTime() > Date.now(),
    maquinaria: anuncio.maquinaria,
    traspaso: anuncio.traspaso
      ? {
          ...anuncio.traspaso,
          alquilerMensual:
            anuncio.traspaso.alquilerMensual != null
              ? Number(anuncio.traspaso.alquilerMensual)
              : null,
        }
      : null,
  };
}

export function serializeAnuncios(
  anuncios: AnuncioConMaquinaria[],
): AnuncioSerializado[] {
  return anuncios.map(serializeAnuncio);
}
