"use client";

import { type ChangeEvent, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ImageUp,
  Loader2,
  Star,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

function extensionDe(nombre: string) {
  const partes = nombre.split(".");
  return partes.length > 1 ? partes.pop() : undefined;
}

async function subirArchivo(file: File) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión expirada.");
  const ext = extensionDe(file.name);
  const path = `${user.id}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
  const { error } = await supabase.storage
    .from("fotos-video")
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("fotos-video").getPublicUrl(path);
  return data.publicUrl;
}

// Reusable photos field for the publish wizards. The first photo is the cover
// (shown in the catalog card + ficha), so the user can reorder and pick it.
export function FotosField({
  fotos,
  onChange,
  error,
}: {
  fotos: string[];
  onChange: (fotos: string[]) => void;
  error?: string;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setErrorSubida(null);
    setSubiendo(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await subirArchivo(file));
      onChange([...fotos, ...urls]);
    } catch {
      setErrorSubida("No se pudieron subir una o más fotos. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  function mover(from: number, to: number) {
    if (to < 0 || to >= fotos.length) return;
    const next = [...fotos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function hacerPortada(index: number) {
    mover(index, 0);
  }

  function quitar(index: number) {
    onChange(fotos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="fotos-input"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-cream/50 px-6 py-10 text-center transition-colors hover:border-gold hover:bg-cream"
      >
        <ImageUp className="size-8 text-gold" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">
          Haz clic para subir fotos
        </span>
        <span className="text-xs text-muted-foreground">
          La primera foto es la portada. Puedes reordenarlas y elegir cuál va
          primero.
        </span>
        <input
          id="fotos-input"
          type="file"
          accept="image/*"
          multiple
          disabled={subiendo}
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      {(fotos.length > 0 || subiendo) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {fotos.map((url, index) => (
            <div
              key={url}
              className={`group relative aspect-square overflow-hidden rounded-lg border bg-muted ${
                index === 0 ? "border-2 border-gold" : "border-border"
              }`}
            >
              <Image
                src={url}
                alt={`Foto ${index + 1}`}
                fill
                sizes="160px"
                className="object-cover"
              />

              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                  <Star className="size-3" aria-hidden="true" />
                  Portada
                </span>
              )}

              <button
                type="button"
                onClick={() => quitar(index)}
                aria-label={`Quitar foto ${index + 1}`}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md bg-background/90 text-foreground transition-colors hover:text-destructive"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-background/85 p-1">
                <button
                  type="button"
                  onClick={() => mover(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Mover a la izquierda"
                  className="flex size-6 items-center justify-center rounded text-foreground disabled:opacity-30 hover:bg-muted"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </button>
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => hacerPortada(index)}
                    title="Hacer portada"
                    aria-label="Hacer portada"
                    className="flex size-6 items-center justify-center rounded text-foreground hover:bg-muted"
                  >
                    <Star className="size-3.5" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => mover(index, index + 1)}
                  disabled={index === fotos.length - 1}
                  aria-label="Mover a la derecha"
                  className="flex size-6 items-center justify-center rounded text-foreground disabled:opacity-30 hover:bg-muted"
                >
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          {subiendo && (
            <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-muted">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {errorSubida && <p className="text-sm text-destructive">{errorSubida}</p>}
    </div>
  );
}
