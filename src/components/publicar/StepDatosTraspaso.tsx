"use client";

import { Controller, useFormContext } from "react-hook-form";
import { GestionBcnBanner } from "@/components/publicar/GestionBcnBanner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCIA_DESTACADA, PROVINCIAS_ORDENADAS } from "@/lib/provincias";
import {
  TIPO_NEGOCIO_TRASPASO_LABEL,
  TIPO_ANUNCIANTE_TRASPASO_LABEL,
  TIPO_LICENCIA_TRASPASO_LABEL,
} from "@/lib/anuncio/labels";
import {
  TipoNegocioTraspaso,
  TipoAnuncianteTraspaso,
  TipoLicenciaTraspaso,
} from "@generated/prisma/enums";
import type { PublicarTraspasoFormInput } from "@/lib/validation/publicarTraspasoSchema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

const TIPOS_NEGOCIO = Object.values(TipoNegocioTraspaso);
const TIPOS_ANUNCIANTE = Object.values(TipoAnuncianteTraspaso);
const RESTO_PROVINCIAS = PROVINCIAS_ORDENADAS.filter(
  (p) => p !== PROVINCIA_DESTACADA,
);

export function StepDatosTraspaso() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<PublicarTraspasoFormInput>();

  // Barcelona particulares get a free professional-management offer -- surfaced
  // as a prominent banner the moment they pick Barcelona, not hidden at the end.
  const provincia = watch("ciudadProvincia");
  const tipoAnunciante = watch("tipoAnunciante");
  const mostrarGestionBcn =
    provincia === PROVINCIA_DESTACADA &&
    tipoAnunciante === TipoAnuncianteTraspaso.PARTICULAR;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Datos del traspaso</h2>

      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          placeholder="Ej: Traspaso de centro de estética en pleno centro"
          aria-invalid={!!errors.titulo}
          {...register("titulo")}
        />
        <FieldError message={errors.titulo?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="precio">Precio de traspaso (€)</Label>
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
                  {RESTO_PROVINCIAS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.ciudadProvincia?.message} />
        </div>
      </div>

      {mostrarGestionBcn && <GestionBcnBanner />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tipoNegocio">Tipo de negocio</Label>
          <Controller
            control={control}
            name="tipoNegocio"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="tipoNegocio" className="w-full">
                  <SelectValue placeholder="Elige el tipo de negocio" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_NEGOCIO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_NEGOCIO_TRASPASO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.tipoNegocio?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoAnunciante">Publicas como</Label>
          <Controller
            control={control}
            name="tipoAnunciante"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="tipoAnunciante" className="w-full">
                  <SelectValue placeholder="Particular o profesional" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ANUNCIANTE.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_ANUNCIANTE_TRASPASO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.tipoAnunciante?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="metrosCuadrados">Superficie (m²)</Label>
          <Input
            id="metrosCuadrados"
            type="number"
            min={0}
            placeholder="Opcional"
            {...register("metrosCuadrados", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cabinas">Cabinas</Label>
          <Input
            id="cabinas"
            type="number"
            min={0}
            placeholder="Opcional"
            {...register("cabinas", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="personal">Personal</Label>
          <Input
            id="personal"
            type="number"
            min={0}
            placeholder="Opcional"
            {...register("personal", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="alquilerMensual">Alquiler mensual (€)</Label>
          <Input
            id="alquilerMensual"
            type="number"
            min={0}
            placeholder="Opcional"
            {...register("alquilerMensual", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoLicencia">Tipo de licencia</Label>
          <Controller
            control={control}
            name="tipoLicencia"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="tipoLicencia" className="w-full">
                  <SelectValue placeholder="Elige el tipo de licencia" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TipoLicenciaTraspaso).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LICENCIA_TRASPASO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          rows={5}
          placeholder="Cuéntale al interesado por qué se traspasa, qué incluye, cartera de clientes, estado del local, etc."
          {...register("descripcion")}
        />
        <FieldError message={errors.descripcion?.message} />
      </div>
    </div>
  );
}
