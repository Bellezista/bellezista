"use client";

import type { CategoriaMaquinaria } from "@generated/prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIA_MAQUINARIA_LABEL } from "@/lib/anuncio/labels";
import { cn } from "@/lib/utils";

const CATEGORIAS = Object.keys(
  CATEGORIA_MAQUINARIA_LABEL
) as CategoriaMaquinaria[];

// Plain text filters, never filled pills -- gold/foreground only ever shows
// up as the thin underline of the active option (see CLAUDE.md visual
// direction: no colored badges/pills).
export function FiltroCategoria() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoriaActiva = searchParams.get("categoria");

  function seleccionar(categoria: CategoriaMaquinaria | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoria) {
      params.set("categoria", categoria);
    } else {
      params.delete("categoria");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const claseBoton = (activo: boolean) =>
    cn(
      "border-b-2 pb-2 text-sm whitespace-nowrap transition-colors",
      activo
        ? "border-foreground font-semibold text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    );

  return (
    <div
      role="tablist"
      aria-label="Filtrar por categoría"
      className="flex w-full flex-wrap items-center gap-x-6 gap-y-2"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!categoriaActiva}
        onClick={() => seleccionar(null)}
        className={claseBoton(!categoriaActiva)}
      >
        Todas
      </button>
      {CATEGORIAS.map((categoria) => (
        <button
          key={categoria}
          type="button"
          role="tab"
          aria-selected={categoriaActiva === categoria}
          onClick={() => seleccionar(categoria)}
          className={claseBoton(categoriaActiva === categoria)}
        >
          {CATEGORIA_MAQUINARIA_LABEL[categoria]}
        </button>
      ))}
    </div>
  );
}
