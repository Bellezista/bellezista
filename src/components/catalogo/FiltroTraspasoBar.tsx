"use client";

import { BuscadorInput } from "@/components/catalogo/BuscadorInput";
import { FiltroCiudad } from "@/components/catalogo/FiltroCiudad";
import { FiltroTipoNegocio } from "@/components/catalogo/FiltroTipoNegocio";
import { FiltroPrecio } from "@/components/catalogo/FiltroPrecio";
import { CrearAlertaButton } from "@/components/alertas/CrearAlertaButton";

// Traspasos catalog filters (client spec): búsqueda por texto, provincia (the
// same España dropdown as Maquinaria), tipo de negocio, and price range. Each
// reads/writes its own URL param independently.
export function FiltroTraspasoBar() {
  return (
    <div className="flex w-full flex-col gap-5">
      <BuscadorInput />
      <div className="grid gap-4 sm:grid-cols-3">
        <FiltroTipoNegocio />
        <FiltroCiudad />
        <FiltroPrecio />
      </div>
      <div className="flex justify-end">
        <CrearAlertaButton seccion="TRASPASOS" />
      </div>
    </div>
  );
}
