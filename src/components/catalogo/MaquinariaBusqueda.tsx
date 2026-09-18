"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SearchX, Search, MapPin } from "lucide-react";
import type { AnuncioSerializado } from "@/types/anuncio";
import { CATEGORIA_MAQUINARIA_LABEL } from "@/lib/anuncio/labels";
import { AnuncioCard } from "@/components/anuncio/AnuncioCard";
import { CrearAlertaButton } from "@/components/alertas/CrearAlertaButton";

type Orden = "recientes" | "precio-asc" | "precio-desc";
const POR_PAGINA = 9;

const CATEGORIAS = Object.entries(CATEGORIA_MAQUINARIA_LABEL) as [
  string,
  string,
][];
// Only two client-facing states. "SEMI" matches any stored non-NUEVO value.
const ESTADOS: [string, string][] = [
  ["NUEVO", "Nuevo"],
  ["SEMI", "Seminuevo"],
];

export function MaquinariaBusqueda({
  anuncios,
}: {
  anuncios: AnuncioSerializado[];
}) {
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [ciudad, setCiudad] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [estados, setEstados] = useState<Set<string>>(new Set());
  const [marca, setMarca] = useState("");
  const [garantia, setGarantia] = useState<"" | "con" | "sin">("");
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
  const marcas = useMemo(
    () =>
      Array.from(
        new Set(anuncios.map((a) => a.maquinaria?.marca).filter(Boolean)),
      ).sort((a, b) => (a as string).localeCompare(b as string, "es")) as string[],
    [anuncios],
  );

  const filtrados = useMemo(() => {
    const min = precioMin ? Number(precioMin) : undefined;
    const max = precioMax ? Number(precioMax) : undefined;
    const texto = q.trim().toLowerCase();

    const res = anuncios.filter((a) => {
      const m = a.maquinaria;
      if (
        texto &&
        !`${a.titulo} ${a.ciudadProvincia} ${m?.marca ?? ""}`
          .toLowerCase()
          .includes(texto)
      )
        return false;
      if (cats.size > 0 && (!m || !cats.has(m.categoria))) return false;
      if (ciudad && a.ciudadProvincia !== ciudad) return false;
      if (min != null && a.precio < min) return false;
      if (max != null && a.precio > max) return false;
      if (estados.size > 0) {
        const key = m?.estadoEquipo === "NUEVO" ? "NUEVO" : "SEMI";
        if (!m || !estados.has(key)) return false;
      }
      if (marca && m?.marca !== marca) return false;
      if (garantia === "con" && !m?.garantiaEnVigor) return false;
      if (garantia === "sin" && m?.garantiaEnVigor) return false;
      return true;
    });

    res.sort((a, b) => {
      if (orden === "precio-asc") return a.precio - b.precio;
      if (orden === "precio-desc") return b.precio - a.precio;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
    return res;
  }, [anuncios, q, cats, ciudad, precioMin, precioMax, estados, marca, garantia, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const filtrosAlerta = useMemo(() => {
    const f: Record<string, string> = {};
    if (q.trim()) f.q = q.trim();
    if (cats.size === 1) f.categoria = [...cats][0];
    if (ciudad) f.ciudad = ciudad;
    if (marca) f.marca = marca;
    if (precioMin) f.precioMin = precioMin;
    if (precioMax) f.precioMax = precioMax;
    return f;
  }, [q, cats, ciudad, marca, precioMin, precioMax]);

  const toggle = (setter: typeof setCats, k: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    reset();
  };

  const categoriaControls = (
    <>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={cats.size === 0}
          onChange={() => {
            setCats(new Set());
            reset();
          }}
          className="size-4 accent-[#cda306]"
        />
        Todas las categorías
      </label>
      {CATEGORIAS.map(([key, label]) => (
        <label
          key={key}
          className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
        >
          <input
            type="checkbox"
            checked={cats.has(key)}
            onChange={() => toggle(setCats, key)}
            className="size-4 accent-[#cda306]"
          />
          {label}
        </label>
      ))}
    </>
  );

  const ubicacionControl = (
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
  );

  const precioControl = (
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
  );

  const estadoControls = ESTADOS.map(([key, label]) => (
    <label
      key={key}
      className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
    >
      <input
        type="checkbox"
        checked={estados.has(key)}
        onChange={() => toggle(setEstados, key)}
        className="size-4 accent-[#cda306]"
      />
      {label}
    </label>
  ));

  const marcaControl = (
    <select
      value={marca}
      onChange={(e) => {
        setMarca(e.target.value);
        reset();
      }}
      className="w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
    >
      <option value="">Todas las marcas</option>
      {marcas.map((mk) => (
        <option key={mk} value={mk}>
          {mk}
        </option>
      ))}
    </select>
  );

  const garantiaControls = (
    <>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={garantia === "con"}
          onChange={() => {
            setGarantia((g) => (g === "con" ? "" : "con"));
            reset();
          }}
          className="size-4 accent-[#cda306]"
        />
        Con garantía en vigor
      </label>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={garantia === "sin"}
          onChange={() => {
            setGarantia((g) => (g === "sin" ? "" : "sin"));
            reset();
          }}
          className="size-4 accent-[#cda306]"
        />
        Sin garantía
      </label>
    </>
  );

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
            placeholder="Busca por nombre, marca o tecnología"
            className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Dropdown label="Categoría" activo={cats.size > 0}>
            {categoriaControls}
          </Dropdown>
          <Dropdown label="Ubicación" activo={!!ciudad}>
            {ubicacionControl}
          </Dropdown>
          <Dropdown label="Precio" activo={!!(precioMin || precioMax)}>
            {precioControl}
          </Dropdown>
          <Dropdown label="Estado" activo={estados.size > 0}>
            <div className="flex flex-col gap-2.5">{estadoControls}</div>
          </Dropdown>
          <Dropdown label="Marca" activo={!!marca}>
            {marcaControl}
          </Dropdown>
          <Dropdown label="Características" activo={!!garantia}>
            <div className="flex flex-col gap-2.5">{garantiaControls}</div>
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

      <div className="grid gap-10 py-8 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="hidden rounded-xl bg-[#f6f2ea] p-6 lg:block lg:sticky lg:top-6 lg:self-start lg:divide-y lg:divide-border lg:[&>*]:py-6 lg:[&>*:first-child]:pt-0">
          <FiltroSeccion titulo="Categoría">{categoriaControls}</FiltroSeccion>
          <FiltroSeccion titulo="Ubicación">{ubicacionControl}</FiltroSeccion>
          <FiltroSeccion titulo="Precio">{precioControl}</FiltroSeccion>
          <FiltroSeccion titulo="Estado del equipo">{estadoControls}</FiltroSeccion>
          <FiltroSeccion titulo="Marca">{marcaControl}</FiltroSeccion>
          <FiltroSeccion titulo="Características">{garantiaControls}</FiltroSeccion>
          <div className="border-t border-border pt-6">
            <CrearAlertaButton
              seccion="MAQUINARIA"
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
            {filtrados.length === 1 ? "equipo encontrado" : "equipos encontrados"}
          </p>

          {visibles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No se encontraron equipos con estos filtros.
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
          <div className="absolute left-0 top-[calc(100%+8px)] z-40 flex w-64 flex-col gap-2.5 rounded-lg border border-border bg-white p-4 shadow-[0_12px_32px_rgba(20,19,16,.16)]">
            {children}
          </div>
        </>
      )}
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
