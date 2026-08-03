"use client";

import Image from "next/image";
import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  TIPO_NEGOCIO_TRASPASO_LABEL,
  TIPO_ANUNCIANTE_TRASPASO_LABEL,
} from "@/lib/anuncio/labels";
import type { AtributoDisplay } from "@/lib/anuncio/subtype-adapters";
import { formatPrecio } from "@/lib/format";
import type { PublicarTraspasoFormInput } from "@/lib/validation/publicarTraspasoSchema";

export function StepRevisionTraspaso() {
  const { getValues, watch, control, formState } =
    useFormContext<PublicarTraspasoFormInput>();
  const values = getValues();
  const fotos = values.fotos ?? [];
  const aceptaCondiciones = watch("aceptaCondiciones");

  const atributos: AtributoDisplay[] = [
    { label: "Título", value: values.titulo || "—" },
    {
      label: "Precio de traspaso",
      value: values.precio ? formatPrecio(Number(values.precio)) : "—",
    },
    { label: "Provincia", value: values.ciudadProvincia || "—" },
    {
      label: "Tipo de negocio",
      value: values.tipoNegocio
        ? TIPO_NEGOCIO_TRASPASO_LABEL[values.tipoNegocio]
        : "—",
    },
    {
      label: "Anunciante",
      value: values.tipoAnunciante
        ? TIPO_ANUNCIANTE_TRASPASO_LABEL[values.tipoAnunciante]
        : "—",
    },
    {
      label: "Superficie",
      value: values.metrosCuadrados ? `${values.metrosCuadrados} m²` : "—",
    },
    { label: "Cabinas", value: values.cabinas ? String(values.cabinas) : "—" },
    {
      label: "Alquiler mensual",
      value: values.alquilerMensual
        ? `${Number(values.alquilerMensual).toLocaleString("es-ES")} €`
        : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Revisa tu traspaso</h2>
      <p className="text-sm text-muted-foreground">
        Confirma que los datos sean correctos antes de publicar. Puedes volver a
        los pasos anteriores para corregir algo.
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
          <p className="text-xs text-muted-foreground">Fotos ({fotos.length})</p>
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
            Revisa los pasos anteriores: hay datos que faltan o no son válidos.
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
        {formState.isSubmitting ? "Publicando..." : "Publicar traspaso"}
      </Button>
    </div>
  );
}
