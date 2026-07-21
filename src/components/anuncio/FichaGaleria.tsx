"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FichaGaleriaProps {
  fotos: string[];
  titulo: string;
}

export function FichaGaleria({ fotos, titulo }: FichaGaleriaProps) {
  const [seleccionada, setSeleccionada] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-muted">
        <span className="text-sm text-muted-foreground">Sin fotos</span>
      </div>
    );
  }

  const fotoActual = fotos[Math.min(seleccionada, fotos.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={fotoActual}
          alt={titulo}
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {fotos.map((foto, index) => {
            const activa = index === seleccionada;
            return (
              <button
                key={foto + index}
                type="button"
                onClick={() => setSeleccionada(index)}
                aria-label={`Ver foto ${index + 1} de ${titulo}`}
                aria-current={activa}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted transition-colors",
                  activa ? "border-gold" : "border-border"
                )}
              >
                <Image
                  src={foto}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
