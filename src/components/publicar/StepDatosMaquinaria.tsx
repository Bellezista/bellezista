"use client";

import { Controller, useFormContext } from "react-hook-form";

// From the pure-data enums module, not @generated/prisma/client -- that file
// also contains the PrismaClient runtime (Node-only internals), which breaks
// the client bundle if a "use client" file imports a value (not just a type)
// from it.
import {
  CategoriaMaquinaria,
  EstadoEquipo,
  NivelServicio,
} from "@generated/prisma/enums";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORIA_MAQUINARIA_LABEL,
  ESTADO_EQUIPO_LABEL,
  NIVEL_SERVICIO_LABEL,
} from "@/lib/anuncio/labels";
import type { PublicarMaquinariaFormInput } from "@/lib/validation/publicarMaquinariaSchema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function StepDatosMaquinaria() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PublicarMaquinariaFormInput>();

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Datos del equipo</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="categoria" className="w-full">
                  <SelectValue placeholder="Elige una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CategoriaMaquinaria).map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {CATEGORIA_MAQUINARIA_LABEL[categoria]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.categoria?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategoria">Subcategoría</Label>
          <Input
            id="subcategoria"
            placeholder="Opcional"
            {...register("subcategoria")}
          />
          <FieldError message={errors.subcategoria?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" aria-invalid={!!errors.marca} {...register("marca")} />
          <FieldError message={errors.marca?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" aria-invalid={!!errors.modelo} {...register("modelo")} />
          <FieldError message={errors.modelo?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroSerie">Número de serie</Label>
          <Input
            id="numeroSerie"
            placeholder="Opcional"
            {...register("numeroSerie")}
          />
          <FieldError message={errors.numeroSerie?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            type="number"
            placeholder="Opcional"
            {...register("anio", {
              // NOT valueAsNumber: true -- an empty optional number input
              // yields NaN that way (not undefined), and z.coerce.number()
              // .optional() rejects NaN, silently failing validation with no
              // visible error since this field isn't part of any step's
              // trigger() check. Empty -> undefined instead.
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
          <FieldError message={errors.anio?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="horasDeUso">Horas de uso</Label>
          <Input
            id="horasDeUso"
            type="number"
            placeholder="Opcional"
            {...register("horasDeUso", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
          <FieldError message={errors.horasDeUso?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="beautyScore">Beauty score (0-10)</Label>
          <Input
            id="beautyScore"
            type="number"
            min={0}
            max={10}
            placeholder="Opcional"
            {...register("beautyScore", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
          <FieldError message={errors.beautyScore?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estadoEquipo">Estado del equipo</Label>
          <Controller
            control={control}
            name="estadoEquipo"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="estadoEquipo" className="w-full">
                  <SelectValue placeholder="Elige el estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EstadoEquipo).map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {ESTADO_EQUIPO_LABEL[estado]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.estadoEquipo?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nivelDeServicio">Nivel de servicio</Label>
          <Controller
            control={control}
            name="nivelDeServicio"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="nivelDeServicio" className="w-full">
                  <SelectValue placeholder="Elige el nivel de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(NivelServicio).map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {NIVEL_SERVICIO_LABEL[nivel]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.nivelDeServicio?.message} />
        </div>

        <div className="space-y-2">
          <span className="block select-none text-sm font-medium text-transparent">
            Médico-estético
          </span>
          <div className="flex h-8 items-center gap-2">
            <Controller
              control={control}
              name="esMedicoEstetico"
              render={({ field }) => (
                <Checkbox
                  id="esMedicoEstetico"
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="esMedicoEstetico" className="font-normal">
              Es equipo médico-estético
            </Label>
          </div>
          <FieldError message={errors.esMedicoEstetico?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaPuestaEnMarcha">Fecha de puesta en marcha</Label>
          <Input
            id="fechaPuestaEnMarcha"
            type="date"
            {...register("fechaPuestaEnMarcha")}
          />
          <FieldError message={errors.fechaPuestaEnMarcha?.message} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            placeholder="Mantenimiento, accesorios incluidos, motivo de venta..."
            rows={5}
            {...register("descripcion")}
          />
          <FieldError message={errors.descripcion?.message} />
        </div>
      </div>
    </div>
  );
}
