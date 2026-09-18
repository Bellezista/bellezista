"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, MapPin, UserRound, Lock, ArrowRight, Briefcase } from "lucide-react";
import type { CvResumen } from "@/types/talento";
import {
  PUESTO_TALENTO_LABEL,
  JORNADA_TALENTO_LABEL,
  DISPONIBILIDAD_TALENTO_LABEL,
} from "@/lib/anuncio/labels";
import { CrearAlertaButton } from "@/components/alertas/CrearAlertaButton";

type Orden = "recientes" | "experiencia";
const POR_PAGINA = 8;

const PUESTOS = Object.entries(PUESTO_TALENTO_LABEL) as [string, string][];
const JORNADAS = Object.entries(JORNADA_TALENTO_LABEL) as [string, string][];
const DISPONS = Object.entries(DISPONIBILIDAD_TALENTO_LABEL) as [string, string][];

export function TalentoBusqueda({ cvs }: { cvs: CvResumen[] }) {
  const [q, setQ] = useState("");
  const [puestos, setPuestos] = useState<Set<string>>(new Set());
  const [provincia, setProvincia] = useState("");
  const [jornadas, setJornadas] = useState<Set<string>>(new Set());
  const [dispon, setDispon] = useState<Set<string>>(new Set());
  const [orden, setOrden] = useState<Orden>("recientes");
  const [pagina, setPagina] = useState(1);

  const reset = () => setPagina(1);

  const provincias = useMemo(
    () =>
      Array.from(new Set(cvs.map((c) => c.provincia))).sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [cvs],
  );

  const filtrados = useMemo(() => {
    const texto = q.trim().toLowerCase();
    const res = cvs.filter((c) => {
      if (
        texto &&
        !`${PUESTO_TALENTO_LABEL[c.puesto]} ${c.provincia}`
          .toLowerCase()
          .includes(texto)
      )
        return false;
      if (puestos.size > 0 && !puestos.has(c.puesto)) return false;
      if (provincia && c.provincia !== provincia) return false;
      if (jornadas.size > 0 && !jornadas.has(c.jornada)) return false;
      if (dispon.size > 0 && !dispon.has(c.disponibilidad)) return false;
      return true;
    });
    if (orden === "experiencia") {
      res.sort((a, b) => b.aniosExperiencia - a.aniosExperiencia);
    }
    return res;
  }, [cvs, q, puestos, provincia, jornadas, dispon, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const filtrosAlerta = useMemo(() => {
    const f: Record<string, string> = {};
    if (q.trim()) f.q = q.trim();
    if (puestos.size === 1) f.puesto = [...puestos][0];
    if (provincia) f.ciudad = provincia;
    return f;
  }, [q, puestos, provincia]);

  const toggle = (setter: typeof setPuestos, k: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    reset();
  };

  return (
    <div className="w-full px-6 py-10 md:px-10 lg:px-16">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* OFERTAS DE EMPLEO -- columna con su propio buscador (muy pronto) */}
        <section>
          <h2 className="mb-5 text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
            Ofertas de empleo
          </h2>
          <div className="relative mb-6">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              disabled
              placeholder="Buscar ofertas de empleo"
              className="w-full cursor-not-allowed rounded-full border border-border bg-cream/50 py-3 pl-11 pr-4 text-sm text-muted-foreground outline-none"
            />
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-[#f6f2ea] px-6 py-16 text-center">
            <Briefcase className="size-8 text-gold" aria-hidden="true" />
            <p className="font-serif text-lg text-foreground">Muy pronto</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Las empresas podrán publicar sus ofertas de empleo aquí. Estamos
              preparándolo.
            </p>
          </div>
        </section>

        {/* TALENTO DESTACADO -- columna con su propio buscador + filtros (muro de pago) */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
              Talento destacado
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {filtrados.length}{" "}
                {filtrados.length === 1 ? "perfil" : "perfiles"}
              </span>
              <CrearAlertaButton
                seccion="TALENTO"
                filtros={filtrosAlerta}
                label="Crear alerta"
              />
            </div>
          </div>

          {/* Buscador propio + filtros */}
          <div className="mb-6 flex flex-col gap-3">
            <div className="relative">
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
                placeholder="Buscar por puesto o ciudad"
                className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Dropdown label="Categoría" activo={puestos.size > 0}>
                {PUESTOS.map(([key, label]) => (
                  <Check key={key} checked={puestos.has(key)} onChange={() => toggle(setPuestos, key)}>
                    {label}
                  </Check>
                ))}
              </Dropdown>
              <Dropdown label="Ubicación" activo={!!provincia}>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold" aria-hidden="true" />
                  <select
                    value={provincia}
                    onChange={(e) => {
                      setProvincia(e.target.value);
                      reset();
                    }}
                    className="w-full rounded-sm border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold"
                  >
                    <option value="">Toda España</option>
                    {provincias.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </Dropdown>
              <Dropdown label="Jornada" activo={jornadas.size > 0}>
                {JORNADAS.map(([key, label]) => (
                  <Check key={key} checked={jornadas.has(key)} onChange={() => toggle(setJornadas, key)}>
                    {label}
                  </Check>
                ))}
              </Dropdown>
              <Dropdown label="Disponibilidad" activo={dispon.size > 0}>
                {DISPONS.map(([key, label]) => (
                  <Check key={key} checked={dispon.has(key)} onChange={() => toggle(setDispon, key)}>
                    {label}
                  </Check>
                ))}
              </Dropdown>
              <label className="ml-auto flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
                Ordenar
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as Orden)}
                  className="rounded-sm border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="experiencia">Más experiencia</option>
                </select>
              </label>
            </div>
          </div>

          {visibles.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No se encontraron perfiles con estos filtros.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {visibles.map((c) => (
                <CvTeaser key={c.id} cv={c} />
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPagina(n)}
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
        </section>
      </div>
    </div>
  );
}

// Public teaser: no name/photo/contact (paywall). Links to the CV detail where
// a business owner can unlock the full profile.
function CvTeaser({ cv }: { cv: CvResumen }) {
  const inmediata = cv.disponibilidad === "INMEDIATA";
  return (
    <Link
      href={`/talento/${cv.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-[#f6f2ea] p-4 shadow-[0_1px_2px_rgba(20,19,16,.04)] transition-shadow hover:shadow-[0_10px_24px_rgba(20,19,16,.1)]"
    >
      <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-[#171512] text-white">
        <UserRound className="size-6" aria-hidden="true" />
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-[#f6f2ea] bg-gold text-foreground">
          <Lock className="size-3" aria-hidden="true" />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-[1.05rem] leading-snug text-foreground">
            {PUESTO_TALENTO_LABEL[cv.puesto]}
          </h3>
          {inmediata && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-green-800">
              Disponible
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {cv.provincia} · {cv.aniosExperiencia}{" "}
          {cv.aniosExperiencia === 1 ? "año" : "años"} de experiencia
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-sm bg-white px-2 py-0.5 text-[0.66rem] font-medium text-foreground/70">
            {JORNADA_TALENTO_LABEL[cv.jornada]}
          </span>
          <span className="rounded-sm bg-white px-2 py-0.5 text-[0.66rem] font-medium text-foreground/70">
            {DISPONIBILIDAD_TALENTO_LABEL[cv.disponibilidad]}
          </span>
        </div>
      </div>

      <ArrowRight
        className="size-4 shrink-0 text-gold transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-[#cda306]"
      />
      {children}
    </label>
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
          <div className="absolute left-0 top-[calc(100%+8px)] z-40 flex w-60 flex-col gap-1 rounded-lg border border-border bg-white p-4 shadow-[0_12px_32px_rgba(20,19,16,.16)]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
