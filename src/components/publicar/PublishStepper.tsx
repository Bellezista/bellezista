"use client";

import { useState } from "react";
import { FormProvider, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  publicarMaquinariaSchema,
  type PublicarMaquinariaInput,
  type PublicarMaquinariaFormInput,
} from "@/lib/validation/publicarMaquinariaSchema";
import { useCrearAnuncio } from "@/hooks/useCrearAnuncio";
import { useActualizarAnuncio } from "@/hooks/useActualizarAnuncio";
import { Button } from "@/components/ui/button";
import { StepDatos } from "@/components/publicar/StepDatos";
import { StepFotos } from "@/components/publicar/StepFotos";
import { StepRevision } from "@/components/publicar/StepRevision";

// Owns the single react-hook-form instance shared across every step (see the
// "publicar-steps" fan-out group's files -- each consumes this via
// useFormContext, none of them call useForm or render their own <form>).
// 3 steps (datos -> fotos -> revisión), matching Manual Visual de
// Pantallas' publish wizard shape.
const STEPS: {
  label: string;
  Component: () => React.JSX.Element;
  fields: Path<PublicarMaquinariaFormInput>[];
}[] = [
  {
    label: "Datos del anuncio",
    Component: StepDatos,
    fields: [
      "titulo",
      "precio",
      "ciudadProvincia",
      "categoria",
      "marca",
      "modelo",
      "estadoEquipo",
    ],
  },
  {
    label: "Fotos y video",
    Component: StepFotos,
    fields: ["fotos"],
  },
  {
    label: "Revisión",
    Component: StepRevision,
    fields: [],
  },
];

interface PublishStepperProps {
  // Present only in edit mode ((app)/publicar/editar/[id]/page.tsx) --
  // switches the final submit from crearAnuncioMaquinaria to
  // actualizarAnuncioMaquinaria and pre-fills the form.
  anuncioId?: string;
  defaultValues?: Partial<PublicarMaquinariaFormInput>;
}

export function PublishStepper({
  anuncioId,
  defaultValues,
}: PublishStepperProps) {
  const [step, setStep] = useState(0);
  const esEdicion = !!anuncioId;

  // Both hooks are always called (rules of hooks) -- only the one matching
  // the current mode is actually triggered on submit.
  const crearAnuncio = useCrearAnuncio();
  const actualizarAnuncio = useActualizarAnuncio(anuncioId ?? "");
  const mutation = esEdicion ? actualizarAnuncio : crearAnuncio;

  const methods = useForm<
    PublicarMaquinariaFormInput,
    unknown,
    PublicarMaquinariaInput
  >({
    resolver: zodResolver(publicarMaquinariaSchema),
    defaultValues: {
      nivelDeServicio: "BASICO",
      esMedicoEstetico: false,
      fotos: [],
      aceptaCondiciones: false,
      ...defaultValues,
    },
  });

  const isLastStep = step === STEPS.length - 1;
  const { Component: StepComponent } = STEPS[step];

  async function handleNext() {
    const valid = await methods.trigger(STEPS[step].fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSubmit(data: PublicarMaquinariaInput) {
    mutation.mutate(data);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 border-t-2 pt-2 text-xs font-medium ${
                i <= step
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        <StepComponent />

        <div className="flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              Atrás
            </Button>
          ) : (
            <span />
          )}
          {!isLastStep && (
            <Button type="button" variant="default" onClick={handleNext}>
              Continuar
            </Button>
          )}
        </div>

        {mutation.data && "error" in mutation.data && (
          <p className="text-sm text-destructive">{mutation.data.error}</p>
        )}
        {mutation.isError && (
          <p className="text-sm text-destructive">
            Ocurrió un error inesperado al publicar. Intenta de nuevo.
          </p>
        )}
      </form>
    </FormProvider>
  );
}
