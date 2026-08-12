"use client";

import { BuscadorInput } from "@/components/catalogo/BuscadorInput";
import { FiltroCiudad } from "@/components/catalogo/FiltroCiudad";
import { FiltroPuesto } from "@/components/talento/FiltroPuesto";

// Talento catalog filters: búsqueda por texto, puesto, and provincia (reusing
// the shared España dropdown). Each reads/writes its own URL param.
export function FiltroTalentoBar() {
  return (
    <div className="flex w-full flex-col gap-5">
      <BuscadorInput />
      <div className="grid gap-4 sm:grid-cols-2">
        <FiltroPuesto />
        <FiltroCiudad />
      </div>
    </div>
  );
}
