"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  cvSchema,
  type CvInput,
  type CvFormInput,
} from "@/lib/validation/cvSchema";
import {
  PuestoTalento,
  JornadaTalento,
  DisponibilidadTalento,
} from "@generated/prisma/enums";
import {
  PUESTO_TALENTO_LABEL,
  JORNADA_TALENTO_LABEL,
  DISPONIBILIDAD_TALENTO_LABEL,
} from "@/lib/anuncio/labels";
import { PROVINCIA_DESTACADA, PROVINCIAS_ORDENADAS } from "@/lib/provincias";
import { useGuardarCv } from "@/hooks/useGuardarCv";
import { Button } from "@/components/ui/button";
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

const PUESTOS = Object.values(PuestoTalento);
const JORNADAS = Object.values(JornadaTalento);
const DISPONIBILIDADES = Object.values(DisponibilidadTalento);
const RESTO_PROVINCIAS = PROVINCIAS_ORDENADAS.filter(
  (p) => p !== PROVINCIA_DESTACADA,
);

export function MiCvForm({
  defaultValues,
}: {
  defaultValues?: Partial<CvFormInput>;
}) {
  const guardar = useGuardarCv();
  const methods = useForm<CvFormInput, unknown, CvInput>({
    resolver: zodResolver(cvSchema),
    defaultValues: {
      jornada: JornadaTalento.INDIFERENTE,
      disponibilidad: DisponibilidadTalento.A_CONVENIR,
      ...defaultValues,
    },
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  function onSubmit(data: CvInput) {
    guardar.mutate(data);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="puesto">Puesto</Label>
            <Controller
              control={control}
              name="puesto"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="puesto" className="w-full">
                    <SelectValue placeholder="Elige tu puesto" />
                  </SelectTrigger>
                  <SelectContent>
                    {PUESTOS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PUESTO_TALENTO_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.puesto?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provincia">Provincia</Label>
            <Controller
              control={control}
              name="provincia"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="provincia" className="w-full">
                    <SelectValue placeholder="Elige tu provincia" />
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
            <FieldError message={errors.provincia?.message} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="aniosExperiencia">Años de experiencia</Label>
            <Input
              id="aniosExperiencia"
              type="number"
              min={0}
              {...register("aniosExperiencia", { valueAsNumber: true })}
            />
            <FieldError message={errors.aniosExperiencia?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jornada">Jornada</Label>
            <Controller
              control={control}
              name="jornada"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="jornada" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JORNADAS.map((j) => (
                      <SelectItem key={j} value={j}>
                        {JORNADA_TALENTO_LABEL[j]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilidad">Disponibilidad</Label>
            <Controller
              control={control}
              name="disponibilidad"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="disponibilidad" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISPONIBILIDADES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DISPONIBILIDAD_TALENTO_LABEL[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="formacion">Formación</Label>
          <Input
            id="formacion"
            placeholder="Titulación, cursos, certificaciones..."
            {...register("formacion")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="habilidades">Habilidades y especialidades</Label>
          <Input
            id="habilidades"
            placeholder="Ej: depilación láser, coloración, uñas acrílicas..."
            {...register("habilidades")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="presentacion">Sobre mí</Label>
          <Textarea
            id="presentacion"
            rows={5}
            placeholder="Cuéntale al negocio quién eres y qué buscas."
            {...register("presentacion")}
          />
        </div>

        {guardar.data && "error" in guardar.data && (
          <p className="text-sm text-destructive">{guardar.data.error}</p>
        )}

        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar mi CV"}
        </Button>
      </form>
    </FormProvider>
  );
}
