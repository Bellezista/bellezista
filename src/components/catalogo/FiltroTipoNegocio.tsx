"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIPO_NEGOCIO_TRASPASO_LABEL } from "@/lib/anuncio/labels";
import type { TipoNegocioTraspaso } from "@generated/prisma/client";

// Nine business types -> a dropdown (cleaner than a 10-chip tab bar), pushing
// the `tipoNegocio` URL param. Same URL-driven pattern as the other filters.
const TODOS = "__todos__";
const TIPOS = Object.keys(
  TIPO_NEGOCIO_TRASPASO_LABEL,
) as TipoNegocioTraspaso[];

export function FiltroTipoNegocio() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actual = searchParams.get("tipoNegocio") ?? TODOS;

  function seleccionar(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== TODOS) {
      params.set("tipoNegocio", value);
    } else {
      params.delete("tipoNegocio");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor="filtro-tipo-negocio">Tipo de negocio</Label>
      <Select value={actual} onValueChange={seleccionar}>
        <SelectTrigger id="filtro-tipo-negocio" className="w-full">
          <SelectValue placeholder="Todos los negocios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los negocios</SelectItem>
          {TIPOS.map((t) => (
            <SelectItem key={t} value={t}>
              {TIPO_NEGOCIO_TRASPASO_LABEL[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
