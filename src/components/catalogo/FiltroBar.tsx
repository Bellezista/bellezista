"use client";

import { BuscadorInput } from "@/components/catalogo/BuscadorInput";
import { FiltroCategoria } from "@/components/catalogo/FiltroCategoria";
import { FiltroCiudad } from "@/components/catalogo/FiltroCiudad";
import { FiltroMarca } from "@/components/catalogo/FiltroMarca";

// Composes the 4 URL-driven catalog filters. Each one reads/writes its own
// query param independently, so this component holds no state of its own.
export function FiltroBar() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:flex-1">
          <BuscadorInput />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="sm:w-48">
            <FiltroMarca />
          </div>
          <div className="sm:w-48">
            <FiltroCiudad />
          </div>
        </div>
      </div>
      <FiltroCategoria />
    </div>
  );
}
