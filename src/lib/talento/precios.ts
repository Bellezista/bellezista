// Precios del desbloqueo de CVs en Talento. IMPORTES ORIENTATIVOS, pendientes de
// confirmar con el cliente. Los importes van en céntimos (Stripe).
export const DESBLOQUEO_INDIVIDUAL = {
  tipo: "individual" as const,
  importe: 490, // 4,90 €
  moneda: "eur" as const,
  nombre: "Desbloqueo de 1 CV",
  descripcion: "Acceso permanente al perfil completo de un candidato.",
};

export const BONO_DESBLOQUEOS = {
  tipo: "bono" as const,
  importe: 1900, // 19,00 €
  moneda: "eur" as const,
  creditos: 5,
  nombre: "Bono de 5 desbloqueos",
  descripcion: "5 desbloqueos para usar con cualquier candidato.",
};

export function formatearImporte(centimos: number, moneda = "eur"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: moneda.toUpperCase(),
  }).format(centimos / 100);
}
