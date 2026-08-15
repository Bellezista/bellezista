"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCIA_DESTACADA, PROVINCIAS_ORDENADAS } from "@/lib/provincias";

// The platform targets Spain, so ciudad_provincia is filtered from a fixed
// province list (Barcelona featured first) instead of free text. Selecting a
// province pushes it to the `ciudad` URL param, matched server-side against
// ciudad_provincia (contains, case-insensitive).
const TODAS = "__todas__";

export function FiltroCiudad() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actual = searchParams.get("ciudad") ?? TODAS;

  function seleccionar(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== TODAS) {
      params.set("ciudad", value);
    } else {
      params.delete("ciudad");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const resto = PROVINCIAS_ORDENADAS.filter((p) => p !== PROVINCIA_DESTACADA);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor="filtro-ciudad">Provincia</Label>
      <Select value={actual} onValueChange={seleccionar}>
        <SelectTrigger
          id="filtro-ciudad"
          className={cn(
            "w-full",
            actual !== TODAS &&
              "border-gold/50 bg-cream font-medium text-foreground",
          )}
        >
          <SelectValue placeholder="Todas las provincias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>Todas las provincias</SelectItem>
          <SelectItem value={PROVINCIA_DESTACADA}>
            {PROVINCIA_DESTACADA}
          </SelectItem>
          <SelectSeparator />
          {resto.map((provincia) => (
            <SelectItem key={provincia} value={provincia}>
              {provincia}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
