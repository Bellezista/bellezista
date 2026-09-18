"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SearchX, Search, MapPin } from "lucide-react";
import type { AnuncioSerializado } from "@/types/anuncio";
import { TIPO_NEGOCIO_TRASPASO_LABEL } from "@/lib/anuncio/labels";
import { AnuncioCard } from "@/components/anuncio/AnuncioCard";
import { CrearAlertaButton } from "@/components/alertas/CrearAlertaButton";

type Orden = "recientes" | "precio-asc" | "precio-desc";
const POR_PAGINA = 9;
const SUP_MAX = 500; // slider tope; SUP_MAX = "sin límite"

const CARACTERISTICAS = [
  { key: "licencia", label: "Con licencia" },
  { key: "enFuncionamiento", label: "En funcionamiento" },
  { key: "aPieDeCalle", label: "A pie de calle" },
  { key: "reformado", label: "Reformado" },
  { key: "conClientela", label: "Con clientela" },
  { key: "conAparatologia", label: "Con aparatología" },
] as const;

const TIPOS = Object.entries(TIPO_NEGOCIO_TRASPASO_LABEL) as [string, string][];

export function TraspasoBusqueda({
  anuncios,
}: {
  anuncios: AnuncioSerializado[];
}) {
  const [q, setQ] = useState("");
  const [tipos, setTipos] = useState<Set<string>>(new Set());
  const [ciudad, setCiudad] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [supMin, setSupMin] = useState(0);
  const [supMax, setSupMax] = useState(SUP_MAX);
  const [carac, setCarac] = useState<Set<string>>(new Set());
  const [orden, setOrden] = useState<Orden>("recientes");
  const [pagina, setPagina] = useState(1);

  const reset = () => setPagina(1);

  const ciudades = useMemo(
    () =>
      Array.from(new Set(anuncios.map((a) => a.ciudadProvincia))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [anuncios],
  );

  const filtrados = useMemo(() => {
    const min = precioMin ? Number(precioMin) : undefined;
    const max = precioMax ? Number(precioMax) : undefined;
    const texto = q.trim().toLowerCase();

    const res = anuncios.filter((a) => {
      const t = a.traspaso;
      if (texto && !`${a.titulo} ${a.ciudadProvincia}`.toLowerCase().includes(texto))
        return false;
      if (tipos.size > 0 && (!t || !tipos.has(t.tipoNegocio))) return false;
      if (ciudad && a.ciudadProvincia !== ciudad) return false;
      if (min != null && a.precio < min) return false;
      if (max != null && a.precio > max) return false;
      if (supMin > 0 || supMax < SUP_MAX) {
        const m = t?.metrosCuadrados;
        if (m == null || m < supMin || m > supMax) return false;
      }
      for (const k of carac) {
        if (k === "licencia") {
          if (!t?.tipoLicencia) return false;
        } else if (!t || (t as Record<string, unknown>)[k] !== true) {
          return false;
        }
      }
      return true;
    });

    res.sort((a, b) => {
      if (orden === "precio-asc") return a.precio - b.precio;
      if (orden === "precio-desc") return b.precio - a.precio;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
    return res;
  }, [anuncios, q, tipos, ciudad, precioMin, precioMax, supMin, supMax, carac, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const filtrosAlerta = useMemo(() => {
    const f: Record<string, string> = {};
    if (q.trim()) f.q = q.trim();
    if (tipos.size === 1) f.tipoNegocio = [...tipos][0];
    if (ciudad) f.ciudad = ciudad;
    if (precioMin) f.precioMin = precioMin;
    if (precioMax) f.precioMax = precioMax;
    return f;
  }, [q, tipos, ciudad, precioMin, precioMax]);

  const toggleTipo = (k: string) => {
    setTipos((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    reset();
  };
  const toggleCarac = (k: string) => {
    setCarac((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    reset();
  };

  return (
    <div className="w-full px-6 md:px-10 lg:px-16">
      {/* Barra de búsqueda + filtros */}
      <div className="flex flex-col gap-3 border-b border-border py-6 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-sm lg:flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              reset();
            }}
            placeholder="Busca por ciudad, zona o tipo de negocio"
            className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Dropdown label="Tipo de negocio" activo={tipos.size > 0}>
            <button
              type="button"
              onClick={() => {
                setTipos(new Set());
                reset();
              }}
              className="mb-1 text-left text-sm font-medium text-gold"
            >
              Todos los negocios
            </button>
            {TIPOS.map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={tipos.has(key)}
                  onChange={() => toggleTipo(key)}
                  className="size-4 accent-[#cda306]"
                />
                {label}
              </label>
            ))}
          </Dropdown>

          <Dropdown label="Ubicación" activo={!!ciudad}>
            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setCiudad("");
                  reset();
                }}
                className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                  ciudad === "" ? "text-gold" : "text-foreground hover:bg-cream"
                }`}
              >
                Todas las ubicaciones
              </button>
              {ciudades.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCiudad(c);
                    reset();
                  }}
                  className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                    ciudad === c ? "text-gold" : "text-foreground hover:bg-cream"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Dropdown>

          <Dropdown label="Precio" activo={!!(precioMin || precioMax)}>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Precio mínimo"
                value={precioMin}
                onChange={(e) => {
                  setPrecioMin(e.target.value);
                  reset();
                }}
                className="w-full rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Precio máximo"
                value={precioMax}
                onChange={(e) => {
                  setPrecioMax(e.target.value);
                  reset();
                }}
                className="w-full rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
          </Dropdown>

          <Dropdown label="Superficie" activo={supMin > 0 || supMax < SUP_MAX}>
            <RangoSuperficie
              min={supMin}
              max={supMax}
              onMin={(v) => {
                setSupMin(v);
                reset();
              }}
              onMax={(v) => {
                setSupMax(v);
                reset();
              }}
            />
          </Dropdown>

          <Dropdown label="Más filtros" activo={carac.size > 0}>
            {CARACTERISTICAS.map((c) => (
              <label
                key={c.key}
                className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={carac.has(c.key)}
                  onChange={() => toggleCarac(c.key)}
                  className="size-4 accent-[#cda306]"
                />
                {c.label}
              </label>
            ))}
          </Dropdown>
        </div>

        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground lg:ml-auto">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="rounded-sm border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          >
            <option value="recientes">Más recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </label>
      </div>

      {/* Sidebar + resultados */}
      <div className="grid gap-10 py-8 lg:grid-cols-[250px_1fr]">
        {/* Sidebar (comparte estado con la barra de desplegables) */}
        <aside className="hidden rounded-xl bg-[#f6f2ea] p-6 lg:block lg:sticky lg:top-6 lg:self-start lg:divide-y lg:divide-border lg:[&>*]:py-6 lg:[&>*:first-child]:pt-0">
          <FiltroSeccion titulo="Tipo de negocio">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={tipos.size === 0}
                onChange={() => {
                  setTipos(new Set());
                  reset();
                }}
                className="size-4 accent-[#cda306]"
              />
              Todos los negocios
            </label>
            {TIPOS.map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={tipos.has(key)}
                  onChange={() => toggleTipo(key)}
                  className="size-4 accent-[#cda306]"
                />
                {label}
              </label>
            ))}
          </FiltroSeccion>

          <FiltroSeccion titulo="Ubicación">
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold"
                aria-hidden="true"
              />
              <select
                value={ciudad}
                onChange={(e) => {
                  setCiudad(e.target.value);
                  reset();
                }}
                className="w-full rounded-sm border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:border-gold"
              >
                <option value="">Elige una ubicación</option>
                {ciudades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </FiltroSeccion>

          <FiltroSeccion titulo="Precio">
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Precio mínimo"
                value={precioMin}
                onChange={(e) => {
                  setPrecioMin(e.target.value);
                  reset();
                }}
                className="w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Precio máximo"
                value={precioMax}
                onChange={(e) => {
                  setPrecioMax(e.target.value);
                  reset();
                }}
                className="w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
          </FiltroSeccion>

          <FiltroSeccion titulo="Superficie">
            <RangoSuperficie
              min={supMin}
              max={supMax}
              onMin={(v) => {
                setSupMin(v);
                reset();
              }}
              onMax={(v) => {
                setSupMax(v);
                reset();
              }}
            />
          </FiltroSeccion>

          <FiltroSeccion titulo="Características">
            {CARACTERISTICAS.map((c) => (
              <label
                key={c.key}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={carac.has(c.key)}
                  onChange={() => toggleCarac(c.key)}
                  className="size-4 accent-[#cda306]"
                />
                {c.label}
              </label>
            ))}
          </FiltroSeccion>

          <div className="border-t border-border pt-6">
            <CrearAlertaButton
              seccion="TRASPASOS"
              filtros={filtrosAlerta}
              label="Crear alerta"
              className="w-full justify-center"
            />
          </div>
        </aside>

        {/* Resultados */}
        <div>
          <p className="mb-6 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filtrados.length}
            </span>{" "}
            {filtrados.length === 1
              ? "traspaso encontrado"
              : "traspasos encontrados"}
          </p>

          {visibles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No se encontraron traspasos con estos filtros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((a, i) => (
                <AnuncioCard
                  key={a.id}
                  anuncio={a}
                  priority={i < 3}
                  destacado={a.destacado}
                />
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <div className="mt-12 flex items-center justify-center gap-1.5 pb-4">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setPagina(n);
                    if (typeof window !== "undefined")
                      window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-current={n === paginaActual ? "page" : undefined}
                  className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
                    n === paginaActual
                      ? "bg-[#171512] text-white"
                      : "border border-border text-foreground hover:border-gold"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dual-thumb superficie range (min–max m²). Two overlaid range inputs with a
// shared gold fill track.
function RangoSuperficie({
  min,
  max,
  onMin,
  onMax,
}: {
  min: number;
  max: number;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
}) {
  const pct = (v: number) => (v / SUP_MAX) * 100;
  const thumb =
    "pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#171512] [&::-webkit-slider-thumb]:shadow " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#171512]";
  return (
    <div>
      <div className="relative h-4">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
        />
        <input
          type="range"
          min={0}
          max={SUP_MAX}
          step={10}
          value={min}
          onChange={(e) => onMin(Math.min(Number(e.target.value), max - 10))}
          className={thumb}
          aria-label="Superficie mínima"
        />
        <input
          type="range"
          min={0}
          max={SUP_MAX}
          step={10}
          value={max}
          onChange={(e) => onMax(Math.max(Number(e.target.value), min + 10))}
          className={thumb}
          aria-label="Superficie máxima"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{min} m²</span>
        <span>{max >= SUP_MAX ? "500+ m²" : `${max} m²`}</span>
      </div>
    </div>
  );
}

function FiltroSeccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-foreground">
        {titulo}
      </h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

// Pill dropdown with click-outside to close.
function Dropdown({
  label,
  activo,
  children,
}: {
  label: string;
  activo: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
          activo
            ? "border-gold bg-gold/10 font-semibold text-foreground"
            : "border-border text-foreground hover:border-gold"
        }`}
      >
        {label}
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-64 rounded-lg border border-border bg-white p-4 shadow-[0_12px_32px_rgba(20,19,16,.16)]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
