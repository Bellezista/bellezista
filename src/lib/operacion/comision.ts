// Commission-with-retention parameters, in one place so pricing/terms are a
// config change, not a code hunt. Commission is deducted from the seller: the
// buyer pays the listed price, the seller receives price - commission.

// 10% commission (a éxito), same rate as the manual gestión service.
export const COMISION_PORCENTAJE = 10;

// Days the money is held after payment before it can be released to the seller.
// The buyer can release earlier by confirming; the cron auto-releases at the end
// of this window if there's no incidencia.
export const PLAZO_REVISION_DIAS = 7;

export const MONEDA_OPERACION = "eur";

// Euros (Decimal string / number) -> integer cents for Stripe.
export function aCentimos(euros: number | string): number {
  return Math.round(Number(euros) * 100);
}

// Platform commission in cents from a gross amount in cents.
export function comisionCentimos(brutoCentimos: number): number {
  return Math.round((brutoCentimos * COMISION_PORCENTAJE) / 100);
}

// What the seller receives (cents): gross minus commission.
export function pagoVendedorCentimos(brutoCentimos: number): number {
  return brutoCentimos - comisionCentimos(brutoCentimos);
}
