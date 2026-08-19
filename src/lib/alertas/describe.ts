import type { SeccionAlerta } from "@generated/prisma/enums";
import {
  CATEGORIA_MAQUINARIA_LABEL,
  TIPO_NEGOCIO_TRASPASO_LABEL,
  PUESTO_TALENTO_LABEL,
} from "@/lib/anuncio/labels";

export const SECCION_ALERTA_LABEL: Record<SeccionAlerta, string> = {
  TRASPASOS: "Traspasos",
  MAQUINARIA: "Maquinaria",
  TALENTO: "Empleo & Talento",
};

const L = (m: Record<string, string>, v: string) => m[v] ?? v;

// Human-readable summary of an alert's stored filters, for the profile list and
// the digest email.
export function describeAlerta(
  seccion: SeccionAlerta,
  filtros: unknown,
): { seccion: string; partes: string[] } {
  const f = (filtros ?? {}) as Record<string, string>;
  const partes: string[] = [];

  if (f.q) partes.push(`"${f.q}"`);
  if (f.tipoNegocio)
    partes.push(L(TIPO_NEGOCIO_TRASPASO_LABEL as Record<string, string>, f.tipoNegocio));
  if (f.categoria)
    partes.push(L(CATEGORIA_MAQUINARIA_LABEL as Record<string, string>, f.categoria));
  if (f.puesto)
    partes.push(L(PUESTO_TALENTO_LABEL as Record<string, string>, f.puesto));
  if (f.marca) partes.push(f.marca);
  if (f.ciudad) partes.push(f.ciudad);
  if (f.precioMin || f.precioMax) {
    const min = f.precioMin ? Number(f.precioMin).toLocaleString("es-ES") : "0";
    const max = f.precioMax
      ? Number(f.precioMax).toLocaleString("es-ES")
      : "sin límite";
    partes.push(`${min} - ${max} €`);
  }

  return { seccion: SECCION_ALERTA_LABEL[seccion], partes };
}
