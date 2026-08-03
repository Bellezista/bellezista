"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Traspaso price range. Two numeric inputs pushing precioMin / precioMax to the
// URL, debounced -- same debounce-then-push pattern as the text filters.
export function FiltroPrecio() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(searchParams.get("precioMin") ?? "");
  const [max, setMax] = useState(searchParams.get("precioMax") ?? "");
  const esPrimerRender = useRef(true);

  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (min) params.set("precioMin", min);
      else params.delete("precioMin");
      if (max) params.set("precioMax", max);
      else params.delete("precioMax");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label>Precio de traspaso (€)</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="Mín."
          value={min}
          onChange={(e) => setMin(e.target.value)}
          aria-label="Precio mínimo"
        />
        <span className="text-sm text-muted-foreground">–</span>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="Máx."
          value={max}
          onChange={(e) => setMax(e.target.value)}
          aria-label="Precio máximo"
        />
      </div>
    </div>
  );
}
