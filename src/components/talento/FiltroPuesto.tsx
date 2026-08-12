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
import { PUESTO_TALENTO_LABEL } from "@/lib/anuncio/labels";
import type { PuestoTalento } from "@generated/prisma/client";

const TODOS = "__todos__";
const PUESTOS = Object.keys(PUESTO_TALENTO_LABEL) as PuestoTalento[];

export function FiltroPuesto() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actual = searchParams.get("puesto") ?? TODOS;

  function seleccionar(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== TODOS) params.set("puesto", value);
    else params.delete("puesto");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor="filtro-puesto">Puesto</Label>
      <Select value={actual} onValueChange={seleccionar}>
        <SelectTrigger id="filtro-puesto" className="w-full">
          <SelectValue placeholder="Todos los puestos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los puestos</SelectItem>
          {PUESTOS.map((p) => (
            <SelectItem key={p} value={p}>
              {PUESTO_TALENTO_LABEL[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
