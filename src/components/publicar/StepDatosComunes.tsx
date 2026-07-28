"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
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
import type { PublicarMaquinariaFormInput } from "@/lib/validation/publicarMaquinariaSchema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function StepDatosComunes() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<PublicarMaquinariaFormInput>();

  const restoProvincias = PROVINCIAS_ORDENADAS.filter(
    (p) => p !== PROVINCIA_DESTACADA,
  );

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
        <Label htmlFor="ciudadProvincia">Provincia</Label>
        <Controller
          control={control}
          name="ciudadProvincia"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="ciudadProvincia" className="w-full">
                <SelectValue placeholder="Elige la provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PROVINCIA_DESTACADA}>
                  {PROVINCIA_DESTACADA}
                </SelectItem>
                <SelectSeparator />
                {restoProvincias.map((provincia) => (
                  <SelectItem key={provincia} value={provincia}>
                    {provincia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.ciudadProvincia?.message} />
      </div>
    </div>
  );
}
