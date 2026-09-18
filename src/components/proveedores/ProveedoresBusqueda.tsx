"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, MapPin, Building2, ExternalLink } from "lucide-react";
import { CATEGORIA_PROVEEDOR_LABEL } from "@/lib/proveedor/categorias";

type Proveedor = {
  id: string;
  nombre: string;
  categoria: string;
  zonaCobertura: string;
  descripcion: string | null;
  logo: string | null;
  web: string | null;
  premium: boolean;
};

const CATEGORIAS = Object.entries(CATEGORIA_PROVEEDOR_LABEL) as [string, string][];

export function ProveedoresBusqueda({
  proveedores,
}: {
  proveedores: Proveedor[];
}) {
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [zona, setZona] = useState("");

  const zonas = useMemo(
    () =>
      Array.from(new Set(proveedores.map((p) => p.zonaCobertura))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [proveedores],
  );

  const filtrados = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return proveedores.filter((p) => {
      if (
        texto &&
        !`${p.nombre} ${p.zonaCobertura} ${CATEGORIA_PROVEEDOR_LABEL[p.categoria as keyof typeof CATEGORIA_PROVEEDOR_LABEL]}`
          .toLowerCase()
          .includes(texto)
      )
        return false;
      if (cats.size > 0 && !cats.has(p.categoria)) return false;
      if (zona && p.zonaCobertura !== zona) return false;
      return true;
    });
  }, [proveedores, q, cats, zona]);

  const toggleCat = (k: string) => {
    setCats((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  return (
    <div className="w-full px-6 py-10 md:px-10 lg:px-16">
      {/* Buscador + filtros */}
      <div className="mb-8 flex flex-col gap-3 border-b border-border pb-6 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-sm lg:flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca por nombre, categoría o zona"
            className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Dropdown label="Categoría" activo={cats.size > 0}>
            {CATEGORIAS.map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={cats.has(key)}
                  onChange={() => toggleCat(key)}
                  className="size-4 accent-[#cda306]"
                />
                {label}
              </label>
            ))}
          </Dropdown>
          <Dropdown label="Ubicación" activo={!!zona}>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold" aria-hidden="true" />
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full rounded-sm border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold"
              >
                <option value="">Toda España</option>
                {zonas.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </Dropdown>
        </div>
        <span className="text-sm text-muted-foreground lg:ml-auto">
          {filtrados.length}{" "}
          {filtrados.length === 1 ? "profesional" : "profesionales"}
        </span>
      </div>

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Building2 className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Aún no hay profesionales en esta categoría. Muy pronto habrá más.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((p) => (
            <ProveedorCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProveedorCard({ p }: { p: Proveedor }) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-[#f6f2ea] p-6 shadow-[0_1px_2px_rgba(20,19,16,.04),0_10px_24px_rgba(20,19,16,.07)]">
      {p.premium && (
        <span className="absolute right-4 top-4 rounded-sm bg-gold px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-foreground">
          Premium
        </span>
      )}

      <div className="flex size-14 items-center justify-center overflow-hidden rounded-lg bg-white">
        {p.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.logo} alt={p.nombre} className="size-full object-contain" />
        ) : (
          <Building2 className="size-6 text-gold" aria-hidden="true" />
        )}
      </div>

      <span className="mt-4 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-gold">
        {CATEGORIA_PROVEEDOR_LABEL[p.categoria as keyof typeof CATEGORIA_PROVEEDOR_LABEL]}
      </span>
      <h3 className="mt-1 font-serif text-[1.15rem] leading-snug text-foreground">
        {p.nombre}
      </h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
        {p.zonaCobertura}
      </p>
      {p.descripcion && (
        <p className="mt-3 line-clamp-3 text-[0.82rem] leading-relaxed text-muted-foreground">
          {p.descripcion}
        </p>
      )}
      {p.web && (
        <a
          href={p.web}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-foreground transition-colors hover:text-gold"
        >
          Visitar web
          <ExternalLink className="size-3.5 text-gold" aria-hidden="true" />
        </a>
      )}
    </article>
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
          <div className="absolute left-0 top-[calc(100%+8px)] z-40 flex w-64 flex-col gap-1 rounded-lg border border-border bg-white p-4 shadow-[0_12px_32px_rgba(20,19,16,.16)]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
