"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// marca isn't a fixed enum (unlike categoria), so it's free text -- same
// debounce-then-push-to-URL pattern as BuscadorInput.
export function FiltroMarca() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("marca") ?? "");
  const esPrimerRender = useRef(true);

  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("marca", value);
      } else {
        params.delete("marca");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor="filtro-marca">Marca</Label>
      <Input
        id="filtro-marca"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ej. Lumenis, Cutera..."
      />
    </div>
  );
}
