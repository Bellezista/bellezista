"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ciudad_provincia is free text on Anuncio, so this filters by a partial,
// case-insensitive match server-side -- same debounce-then-push pattern as
// FiltroMarca / BuscadorInput.
export function FiltroCiudad() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("ciudad") ?? "");
  const esPrimerRender = useRef(true);

  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("ciudad", value);
      } else {
        params.delete("ciudad");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor="filtro-ciudad">Ciudad / Provincia</Label>
      <Input
        id="filtro-ciudad"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ej. Ciudad de México..."
      />
    </div>
  );
}
