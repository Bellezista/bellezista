"use client";

import { useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { FotosField } from "@/components/publicar/FotosField";
import type { PublicarTraspasoFormInput } from "@/lib/validation/publicarTraspasoSchema";

export function StepFotosTraspaso() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<PublicarTraspasoFormInput>();

  const fotos = watch("fotos") ?? [];

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Fotos del negocio</h2>

      <div className="space-y-3">
        <Label>Fotos</Label>
        <FotosField
          fotos={fotos}
          onChange={(next) =>
            setValue("fotos", next, { shouldValidate: true })
          }
          error={errors.fotos?.message}
        />
      </div>
    </div>
  );
}
