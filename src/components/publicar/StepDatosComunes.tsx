"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicarMaquinariaFormInput } from "@/lib/validation/publicarMaquinariaSchema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function StepDatosComunes() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PublicarMaquinariaFormInput>();

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Datos del anuncio</h2>

      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          placeholder="Ej: Máquina de depilación láser diodo"
          aria-invalid={!!errors.titulo}
          {...register("titulo")}
        />
        <FieldError message={errors.titulo?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="precio">Precio</Label>
        <Input
          id="precio"
          type="number"
          step="1"
          placeholder="0"
          aria-invalid={!!errors.precio}
          {...register("precio", { valueAsNumber: true })}
        />
        <FieldError message={errors.precio?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ciudadProvincia">Ciudad / Provincia</Label>
        <Input
          id="ciudadProvincia"
          placeholder="Ej: Barcelona, Cataluña"
          aria-invalid={!!errors.ciudadProvincia}
          {...register("ciudadProvincia")}
        />
        <FieldError message={errors.ciudadProvincia?.message} />
      </div>
    </div>
  );
}
