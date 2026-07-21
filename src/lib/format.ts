// Shared formatting helpers so money/date/time rendering is consistent across
// every component instead of each one inventing its own.

export function formatPrecio(precio: number | string): string {
  return Number(precio).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
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

  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}
