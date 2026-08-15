"use client";

import { type ChangeEvent, useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
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
  ExpectativaSalarial,
} from "@generated/prisma/enums";
import {
  PUESTO_TALENTO_LABEL,
  JORNADA_TALENTO_LABEL,
  DISPONIBILIDAD_TALENTO_LABEL,
  EXPECTATIVA_SALARIAL_LABEL,
} from "@/lib/anuncio/labels";
import { tecnicasDePuesto } from "@/lib/talento/cv-tecnicas";
import { PROVINCIA_DESTACADA, PROVINCIAS_ORDENADAS } from "@/lib/provincias";
import { createClient } from "@/lib/supabase/client";
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
const EXPECTATIVAS = Object.values(ExpectativaSalarial);
const RESTO_PROVINCIAS = PROVINCIAS_ORDENADAS.filter(
  (p) => p !== PROVINCIA_DESTACADA,
);

// Single-photo uploader for the candidate. Same Storage pattern as the publish
// wizard (public fotos-video bucket, path prefixed with the user's id for RLS).
function FotoCandidato() {
  const { setValue, watch } = useFormContext<CvFormInput>();
  const foto = watch("foto");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setSubiendo(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión expirada.");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
      const { error: upErr } = await supabase.storage
        .from("fotos-video")
        .upload(path, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("fotos-video").getPublicUrl(path);
      setValue("foto", data.publicUrl, { shouldDirty: true });
    } catch {
      setError("No se pudo subir la foto. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="foto-input">Foto (opcional)</Label>
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          {foto ? (
            <Image src={foto} alt="Foto del candidato" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Sin foto
            </div>
          )}
          {subiendo && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Input
            id="foto-input"
            type="file"
            accept="image/*"
            disabled={subiendo}
            onChange={handleChange}
            className="max-w-xs"
          />
          {foto && (
            <button
              type="button"
              onClick={() => setValue("foto", undefined, { shouldDirty: true })}
              className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" aria-hidden="true" /> Quitar foto
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

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
        <FotoCandidato />

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            placeholder="Tu nombre y apellidos"
            {...register("nombre")}
          />
          <FieldError message={errors.nombre?.message} />
        </div>

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
          <Controller
            control={control}
            name="expectativaSalarial"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="expectativaSalarial" className="w-full">
                  <SelectValue placeholder="Elige un rango" />
                </SelectTrigger>
                <SelectContent>
                  {EXPECTATIVAS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {EXPECTATIVA_SALARIAL_LABEL[e]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
