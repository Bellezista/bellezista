"use client";

import Image from "next/image";
import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  CATEGORIA_MAQUINARIA_LABEL,
  ESTADO_EQUIPO_LABEL,
} from "@/lib/anuncio/labels";
import type { AtributoDisplay } from "@/lib/anuncio/subtype-adapters";
import { formatPrecio } from "@/lib/format";
import type { PublicarMaquinariaFormInput } from "@/lib/validation/publicarMaquinariaSchema";

export function StepRevision() {
  const {
    getValues,
    watch,
    control,
    formState,
  } = useFormContext<PublicarMaquinariaFormInput>();
  const values = getValues();
  const fotos = values.fotos ?? [];
  const aceptaCondiciones = watch("aceptaCondiciones");

  const atributos: AtributoDisplay[] = [
    { label: "Título", value: values.titulo || "—" },
    {
      label: "Precio",
      value: values.precio ? formatPrecio(Number(values.precio)) : "—",
    },
    { label: "Ciudad / Provincia", value: values.ciudadProvincia || "—" },
    {
      label: "Categoría",
      value: values.categoria
        ? CATEGORIA_MAQUINARIA_LABEL[values.categoria]
        : "—",
    },
    { label: "Marca", value: values.marca || "—" },
    { label: "Modelo", value: values.modelo || "—" },
    {
      label: "Estado del equipo",
      value: values.estadoEquipo ? ESTADO_EQUIPO_LABEL[values.estadoEquipo] : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Revisa tu anuncio</h2>
      <p className="text-sm text-muted-foreground">
        Confirma que los datos sean correctos antes de publicar. Puedes
        volver a los pasos anteriores para corregir algo.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {atributos.map((atributo) => (
          <div key={atributo.label} className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">{atributo.label}</p>
            <p className="text-sm font-medium">{atributo.value}</p>
          </div>
        ))}
      </div>

      {fotos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Fotos ({fotos.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {fotos.map((url, index) => (
              <div
                key={url}
                className="relative size-16 overflow-hidden rounded-md border border-border bg-muted"
              >
                <Image
                  src={url}
                  alt={`Foto ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(formState.errors).length > 0 && (
        <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm font-medium text-destructive">
            Revisa los pasos anteriores: hay datos que faltan o no son
            válidos.
          </p>
          <ul className="list-inside list-disc text-xs text-destructive">
            {Object.values(formState.errors).map((error, index) => (
              <li key={index}>{error?.message?.toString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="aceptaCondiciones"
          render={({ field }) => (
            <Checkbox
              id="aceptaCondiciones"
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="aceptaCondiciones" className="font-normal">
          Confirmo que la información es veraz y acepto las condiciones de
          publicación de Bellezista.
        </Label>
      </div>

      <Button
        type="submit"
        variant="default"
        disabled={formState.isSubmitting || !aceptaCondiciones}
      >
        {formState.isSubmitting ? "Publicando..." : "Publicar anuncio"}
      </Button>
    </div>
  );
}
