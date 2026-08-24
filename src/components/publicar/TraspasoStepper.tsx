"use client";

import { useState } from "react";
import Link from "next/link";
import { FormProvider, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  publicarTraspasoSchema,
  type PublicarTraspasoInput,
  type PublicarTraspasoFormInput,
} from "@/lib/validation/publicarTraspasoSchema";
import { TipoAnuncianteTraspaso } from "@generated/prisma/enums";
import { useCrearTraspaso } from "@/hooks/useCrearTraspaso";
import { useActualizarTraspaso } from "@/hooks/useActualizarTraspaso";
import { Button } from "@/components/ui/button";
import { StepDatosTraspaso } from "@/components/publicar/StepDatosTraspaso";
import { StepFotosTraspaso } from "@/components/publicar/StepFotosTraspaso";
import { StepRevisionTraspaso } from "@/components/publicar/StepRevisionTraspaso";

// Traspaso publish wizard -- same 3-step shape as PublishStepper (datos ->
// fotos -> revisión), its own schema/steps. One react-hook-form instance
// shared across steps via useFormContext.
const STEPS: {
  label: string;
  Component: () => React.JSX.Element;
  fields: Path<PublicarTraspasoFormInput>[];
}[] = [
  {
    label: "Datos del traspaso",
    Component: StepDatosTraspaso,
    fields: ["titulo", "precio", "ciudadProvincia", "tipoNegocio", "tipoAnunciante"],
  },
  { label: "Fotos", Component: StepFotosTraspaso, fields: ["fotos"] },
  { label: "Revisión", Component: StepRevisionTraspaso, fields: [] },
];

interface TraspasoStepperProps {
  anuncioId?: string;
  defaultValues?: Partial<PublicarTraspasoFormInput>;
}

export function TraspasoStepper({
  anuncioId,
  defaultValues,
}: TraspasoStepperProps) {
  const [step, setStep] = useState(0);
  const esEdicion = !!anuncioId;

  const crear = useCrearTraspaso();
  const actualizar = useActualizarTraspaso(anuncioId ?? "");
  const mutation = esEdicion ? actualizar : crear;

  const methods = useForm<
    PublicarTraspasoFormInput,
    unknown,
    PublicarTraspasoInput
  >({
    resolver: zodResolver(publicarTraspasoSchema),
    defaultValues: {
      tipoAnunciante: TipoAnuncianteTraspaso.PARTICULAR,
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

  function onSubmit(data: PublicarTraspasoInput) {
    mutation.mutate(data);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 border-t-2 pt-2 text-xs font-medium transition-colors ${
                i <= step
                  ? "border-gold text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span className={i <= step ? "text-gold" : undefined}>
                {`0${i + 1}`}
              </span>{" "}
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
          (mutation.data as { limiteAlcanzado?: boolean }).limiteAlcanzado ? (
            <div className="space-y-3 rounded-lg border border-gold/40 bg-gold/10 p-4">
              <p className="text-sm text-foreground">{mutation.data.error}</p>
              <Button
                asChild
                className="gap-1.5 rounded-full bg-gold font-semibold text-foreground hover:bg-gold/90"
              >
                <Link href="/planes-profesionales">
                  Ver planes profesionales
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-destructive">{mutation.data.error}</p>
          )
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
