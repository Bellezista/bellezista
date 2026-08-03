"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { ImageIcon, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { PublicarTraspasoFormInput } from "@/lib/validation/publicarTraspasoSchema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function extensionDe(nombreArchivo: string) {
  const partes = nombreArchivo.split(".");
  return partes.length > 1 ? partes.pop() : undefined;
}

// Real Storage upload, path prefixed with the caller's own id -- matches the
// RLS policy in supabase/migrations/0004_storage_buckets.sql. Same as
// StepFotos, but Traspasos only have photos (no video/factura).
async function subirArchivo(file: File) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión expirada.");

  const extension = extensionDe(file.name);
  const path = `${user.id}/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;
  const { error } = await supabase.storage
    .from("fotos-video")
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("fotos-video").getPublicUrl(path);
  return data.publicUrl;
}

export function StepFotosTraspaso() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<PublicarTraspasoFormInput>();

  const fotos = watch("fotos") ?? [];
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  async function handleFotosChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setErrorSubida(null);
    setSubiendo(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await subirArchivo(file));
      setValue("fotos", [...fotos, ...urls], { shouldValidate: true });
    } catch {
      setErrorSubida("No se pudieron subir una o más fotos. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  function handleRemoveFoto(index: number) {
    setValue(
      "fotos",
      fotos.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Fotos del negocio</h2>

      <div className="space-y-3">
        <Label htmlFor="fotos-input">Fotos</Label>
        <Input
          id="fotos-input"
          type="file"
          accept="image/*"
          multiple
          disabled={subiendo}
          onChange={handleFotosChange}
        />
        <FieldError message={errors.fotos?.message} />

        {fotos.length > 0 || subiendo ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {fotos.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
              >
                <Image
                  src={url}
                  alt={`Foto ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  className="absolute top-1 right-1 bg-background/90"
                  onClick={() => handleRemoveFoto(index)}
                  aria-label={`Quitar foto ${index + 1}`}
                >
                  <X />
                </Button>
              </div>
            ))}
            {subiendo && (
              <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-muted">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex aspect-[3/1] items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground">
            <ImageIcon className="size-4" />
            Todavía no subiste fotos
          </div>
        )}
      </div>

      {errorSubida && <p className="text-sm text-destructive">{errorSubida}</p>}
    </div>
  );
}
