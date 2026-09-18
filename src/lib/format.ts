// Shared formatting helpers so money/date/time rendering is consistent across
// every component instead of each one inventing its own.

export function formatPrecio(precio: number | string): string {
  // Intl.NumberFormat (not Number.toLocaleString) so we can pass
  // minimumGroupingDigits: Spanish CLDR omits the thousands separator for
  // 4-digit numbers ("8500 €"); forcing grouping keeps every price consistent
  // ("8.500 €").
  const opts: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  };
  // Spanish CLDR omits the thousands separator for 4-digit numbers ("8500 €").
  // useGrouping:"always" forces grouping so every price is consistent
  // ("8.500 €"). Cast because this TS lib types useGrouping as boolean only.
  (opts as Record<string, unknown>).useGrouping = "always";
  return new Intl.NumberFormat("es-ES", opts).format(Number(precio));
}

export function formatFechaRelativa(fecha: Date | string): string {
  const date = typeof fecha === "string" ? new Date(fecha) : fecha;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `hace ${diffHoras} h`;
  const diffDias = Math.round(diffHoras / 24);
  if (diffDias < 7) return `hace ${diffDias} d`;

  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
