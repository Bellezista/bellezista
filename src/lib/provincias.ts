// The platform targets Spain (Manual 00), primarily Barcelona. Used by the
// catalog city filter and the publish form so listings and filtering share the
// same fixed set of provinces instead of free text.

// Featured first in dropdowns -- the client's main market.
export const PROVINCIA_DESTACADA = "Barcelona";

// The 50 provinces plus the two autonomous cities (Ceuta, Melilla).
export const PROVINCIAS_ES = [
  "Álava",
  "Albacete",
  "Alicante",
  "Almería",
  "Asturias",
  "Ávila",
  "Badajoz",
  "Barcelona",
  "Bizkaia",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cantabria",
  "Castellón",
  "Ceuta",
  "Ciudad Real",
  "Córdoba",
  "A Coruña",
  "Cuenca",
  "Girona",
  "Granada",
  "Guadalajara",
  "Gipuzkoa",
  "Huelva",
  "Huesca",
  "Illes Balears",
  "Jaén",
  "León",
  "Lleida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Melilla",
  "Murcia",
  "Navarra",
  "Ourense",
  "Palencia",
  "Las Palmas",
  "Pontevedra",
  "La Rioja",
  "Salamanca",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Zamora",
  "Zaragoza",
] as const;

// Barcelona first, then every other province alphabetically -- the display
// order for province dropdowns.
export const PROVINCIAS_ORDENADAS = [
  PROVINCIA_DESTACADA,
  ...PROVINCIAS_ES.filter((p) => p !== PROVINCIA_DESTACADA),
];
