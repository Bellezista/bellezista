"use client";

import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  cvSchema,
  type CvInput,
  type CvFormInput,
  type CvTecnicaInput,
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
import { tecnicasDePuesto } from "@/lib/talento/cv-tecnicas";
import { PROVINCIA_DESTACADA, PROVINCIAS_ORDENADAS } from "@/lib/provincias";
import { useGuardarCv } from "@/hooks/useGuardarCv";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

// Bloque específico según el puesto seleccionado: checklist de técnicas, cada
// una con años de experiencia. Se guarda solo lo marcado (presencia = "sabe").
function TecnicasBlock() {
  const { control, setValue } = useFormContext<CvFormInput>();
  const puesto = useWatch({ control, name: "puesto" }) as
    | PuestoTalento
    | undefined;
  const tecnicas = (useWatch({ control, name: "tecnicas" }) ??
    []) as CvTecnicaInput[];

  const defs = puesto ? tecnicasDePuesto(puesto) : [];
  if (!puesto || defs.length === 0) return null;

  const seleccion = new Map(tecnicas.map((t) => [t.key, t]));

  function toggle(key: string, checked: boolean) {
    const resto = tecnicas.filter((t) => t.key !== key);
    const next = checked
      ? [...resto, { key, anios: seleccion.get(key)?.anios ?? 0 }]
      : resto;
    setValue("tecnicas", next, { shouldDirty: true });
  }

  function setAnios(key: string, anios: number) {
    setValue(
      "tecnicas",
      tecnicas.map((t) => (t.key === key ? { ...t, anios } : t)),
      { shouldDirty: true },
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-cream/50 p-5">
      <div>
        <h2 className="font-serif text-lg text-foreground">
          Técnicas y aparatología
        </h2>
        <p className="text-sm text-muted-foreground">
          Marca las que dominas e indica tus años de experiencia con cada una.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {defs.map((def) => {
          const sel = seleccion.get(def.key);
          const marcada = Boolean(sel);
          return (
            <li
              key={def.key}
              className="flex flex-wrap items-center gap-3 py-2.5"
            >
              <label className="flex flex-1 items-center gap-3 text-sm text-foreground">
                <Checkbox
                  checked={marcada}
                  onCheckedChange={(v) => toggle(def.key, v === true)}
                />
                <span>{def.label}</span>
              </label>
              {marcada && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={sel?.anios ?? 0}
                    onChange={(e) =>
                      setAnios(def.key, Number(e.target.value) || 0)
                    }
                    className="h-9 w-20"
                    aria-label={`Años de experiencia con ${def.label}`}
                  />
                  <span className="text-xs text-muted-foreground">años</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MiCvForm({
  defaultValues,
}: {
  defaultValues?: Partial<CvFormInput>;
}) {
  const guardar = useGuardarCv();
  const methods = useForm<CvFormInput, unknown, CvInput>({
    resolver: zodResolver(cvSchema),
    defaultValues: {
      jornada: JornadaTalento.POR_HORAS,
      disponibilidad: DisponibilidadTalento.A_CONVENIR,
      tecnicas: [],
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
          <Label htmlFor="expectativaSalarial">
            Expectativa salarial{" "}
            <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="expectativaSalarial"
            placeholder="Ej: 1.200 – 1.500 € / mes"
            {...register("expectativaSalarial")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="titulacion">Titulación / formación reglada</Label>
            <Input
              id="titulacion"
              placeholder="Ej: Grado superior en Estética"
              {...register("titulacion")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cursos">Cursos o certificaciones</Label>
            <Input
              id="cursos"
              placeholder="Ej: láser diodo, microblading, extensiones..."
              {...register("cursos")}
            />
          </div>
        </div>

        <TecnicasBlock />

        <div className="space-y-2">
          <Label htmlFor="presentacion">Presentación</Label>
          <Textarea
            id="presentacion"
            rows={4}
            maxLength={300}
            placeholder="Preséntate en pocas líneas: motivación y estilo de trabajo (máx. 300 caracteres)."
            {...register("presentacion")}
          />
          <FieldError message={errors.presentacion?.message} />
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
