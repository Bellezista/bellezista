import type { PuestoTalento } from "@generated/prisma/enums";

// Bloque específico de técnicas / aparatología por puesto (spec del cliente,
// CV_Estandar_Talento_Bellezista). Cada técnica es una clave estable (guardada
// en cv_tecnica.tecnica) + su etiqueta visible. El catálogo vive en código para
// poder ampliarlo sin migraciones.
export type TecnicaDef = { key: string; label: string };

export const TECNICAS_POR_PUESTO: Record<PuestoTalento, TecnicaDef[]> = {
  PELUQUERO: [
    { key: "tinte-raiz", label: "Tinte raíz" },
    { key: "mechas-tradicionales", label: "Mechas tradicionales" },
    { key: "balayage", label: "Balayage" },
    { key: "babylights", label: "Babylights" },
    { key: "ombre", label: "Ombré" },
    { key: "decoloracion", label: "Decoloración" },
    { key: "corte-dama", label: "Corte dama" },
    { key: "corte-caballero", label: "Corte caballero" },
    { key: "corte-infantil", label: "Corte infantil" },
    { key: "alisado-japones", label: "Alisado japonés" },
    { key: "keratina-botox", label: "Keratina / botox capilar" },
    { key: "alisado-calor", label: "Alisado con calor" },
    { key: "recogidos-novia", label: "Recogidos / peinados de novia" },
    { key: "extensiones-cabello", label: "Extensiones de cabello" },
  ],
  BARBERO: [
    { key: "corte-maquina", label: "Corte a máquina" },
    { key: "corte-tijera", label: "Corte a tijera" },
    { key: "arreglo-barba", label: "Arreglo y diseño de barba" },
    { key: "afeitado-navaja", label: "Afeitado a navaja" },
    { key: "tinte-barba", label: "Tinte de barba" },
  ],
  ESTETICISTA: [
    { key: "laser-diodo", label: "Láser diodo" },
    { key: "ipl", label: "IPL (fotodepilación)" },
    { key: "radiofrecuencia", label: "Radiofrecuencia" },
    { key: "hifu", label: "HIFU" },
    { key: "presoterapia", label: "Presoterapia" },
    { key: "cavitacion-criolipolisis", label: "Cavitación / Criolipólisis" },
    { key: "microdermoabrasion", label: "Microdermoabrasión" },
    { key: "dermapen-microneedling", label: "Dermapen / microneedling" },
    { key: "vacumterapia", label: "Vacumterapia" },
  ],
  MANICURISTA: [
    { key: "manicura-semipermanente", label: "Manicura semipermanente" },
    { key: "unas-acrilicas", label: "Uñas acrílicas" },
    { key: "unas-gel", label: "Uñas de gel" },
    { key: "nail-art", label: "Nail art / decoración" },
    { key: "pedicura-spa", label: "Pedicura spa" },
  ],
  MASAJISTA: [
    { key: "masaje-relajante", label: "Masaje relajante" },
    { key: "masaje-descontracturante", label: "Masaje descontracturante" },
    { key: "drenaje-linfatico", label: "Drenaje linfático" },
    { key: "masaje-deportivo", label: "Masaje deportivo" },
    { key: "reflexologia-podal", label: "Reflexología podal" },
  ],
  MAQUILLADOR: [
    { key: "maquillaje-social-novia", label: "Maquillaje social / novia" },
    {
      key: "cejas-pestanas",
      label: "Cejas y pestañas (laminado, extensiones, microblading)",
    },
    { key: "depilacion-cera-hilo", label: "Depilación (cera / hilo)" },
  ],
  // Sin bloque técnico: solo datos básicos, formación y presentación.
  RECEPCIONISTA: [],
  OTROS: [],
};

const TECNICA_LABEL: Record<string, string> = Object.values(
  TECNICAS_POR_PUESTO,
).reduce((acc, defs) => {
  for (const d of defs) acc[d.key] = d.label;
  return acc;
}, {} as Record<string, string>);

export function labelTecnica(key: string): string {
  return TECNICA_LABEL[key] ?? key;
}

export function tecnicasDePuesto(puesto: PuestoTalento): TecnicaDef[] {
  return TECNICAS_POR_PUESTO[puesto] ?? [];
}
