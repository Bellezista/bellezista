// Builds a URL-safe, unique-ish slug for an offer landing: a readable prefix
// from the title plus a short random suffix so two offers with the same title
// never collide (the DB column is unique as a hard guarantee).
export function generarSlugOferta(titulo: string): string {
  const base = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accent marks
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const sufijo = crypto.randomUUID().slice(0, 6);
  return `${base || "oferta"}-${sufijo}`;
}

// Normalizes a phone number to digits only (for a wa.me link).
export function normalizarWhatsapp(telefono: string): string {
  return telefono.replace(/\D+/g, "");
}
