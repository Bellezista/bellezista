// Precios del desbloqueo de CVs en Talento (tarifas cerradas por el cliente).
// Los importes van en céntimos (Stripe).
export const DESBLOQUEO_INDIVIDUAL = {
  tipo: "individual" as const,
  importe: 690, // 6,90 €
  moneda: "eur" as const,
  nombre: "Desbloqueo de 1 CV",
  descripcion: "Acceso permanente al perfil completo de un candidato.",
};

export const BONO_DESBLOQUEOS = {
  tipo: "bono" as const,
  importe: 4900, // 49 € (4,90 € por CV)
  moneda: "eur" as const,
  creditos: 10,
  nombre: "Bono de 10 desbloqueos",
  descripcion: "10 desbloqueos para usar con cualquier candidato (4,90 € cada uno).",
};

export function formatearImporte(centimos: number, moneda = "eur"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: moneda.toUpperCase(),
  }).format(centimos / 100);
}
