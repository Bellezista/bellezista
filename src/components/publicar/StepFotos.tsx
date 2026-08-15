"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FileText, Loader2, Video as VideoIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FotosField } from "@/components/publicar/FotosField";
import { createClient } from "@/lib/supabase/client";
import type { PublicarMaquinariaFormInput } from "@/lib/validation/publicarMaquinariaSchema";

function extensionDe(nombreArchivo: string) {
  const partes = nombreArchivo.split(".");
  return partes.length > 1 ? partes.pop() : undefined;
}

// Real Storage upload, path prefixed with the caller's own id -- matches the
// `(storage.foldername(name))[1] = auth.uid()::text` RLS policy in
// supabase/migrations/0004_storage_buckets.sql, the only thing that lets this
// insert succeed at all.
async function subirArchivo(bucket: "fotos-video" | "facturas", file: File) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión expirada.");

  const extension = extensionDe(file.name);
  const path = `${user.id}/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;

  return { supabase, path };
}

export function StepFotos() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<PublicarMaquinariaFormInput>();

  const fotos = watch("fotos") ?? [];
  const video = watch("video");
  const factura = watch("factura");

  // Local-only display names for the optional single-file fields (the form
  // itself only stores the Storage URL/path, not the original filename).
  const [videoNombre, setVideoNombre] = useState<string | null>(null);
  const [facturaNombre, setFacturaNombre] = useState<string | null>(null);
  const [subiendoVideo, setSubiendoVideo] = useState(false);
  const [subiendoFactura, setSubiendoFactura] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  async function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setErrorSubida(null);
    setSubiendoVideo(true);
    try {
      const { supabase, path } = await subirArchivo("fotos-video", file);
      const { data } = supabase.storage.from("fotos-video").getPublicUrl(path);
      setValue("video", data.publicUrl, { shouldValidate: true });
      setVideoNombre(file.name);
    } catch {
      setErrorSubida("No se pudo subir el video. Intenta de nuevo.");
    } finally {
      setSubiendoVideo(false);
    }
  }

  function handleRemoveVideo() {
    setValue("video", undefined, { shouldValidate: true });
    setVideoNombre(null);
  }

  async function handleFacturaChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setErrorSubida(null);
    setSubiendoFactura(true);
    try {
      // facturas is a private bucket -- store the object path, not a public
      // URL (there isn't one). Whatever reads this later signs it on demand.
      const { path } = await subirArchivo("facturas", file);
      setValue("factura", path, { shouldValidate: true });
      setFacturaNombre(file.name);
    } catch {
      setErrorSubida("No se pudo subir la factura. Intenta de nuevo.");
    } finally {
      setSubiendoFactura(false);
    }
  }

  function handleRemoveFactura() {
    setValue("factura", undefined, { shouldValidate: true });
    setFacturaNombre(null);
  }

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl">Fotos y video</h2>

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

      <div className="space-y-3">
        <Label htmlFor="video-input">Video (opcional)</Label>
        <Input
          id="video-input"
          type="file"
          accept="video/*"
          disabled={subiendoVideo}
          onChange={handleVideoChange}
        />
        {subiendoVideo && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        {video && !subiendoVideo && (
          <div className="flex w-fit items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
            <VideoIcon className="size-4 text-muted-foreground" />
            <span className="max-w-48 truncate">
              {videoNombre ?? "Video cargado"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleRemoveVideo}
              aria-label="Quitar video"
            >
              <X />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="factura-input">Factura de compra (opcional)</Label>
        <Input
          id="factura-input"
          type="file"
          accept=".pdf,image/*"
          disabled={subiendoFactura}
          onChange={handleFacturaChange}
        />
        {subiendoFactura && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        {factura && !subiendoFactura && (
          <div className="flex w-fit items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
            <FileText className="size-4 text-muted-foreground" />
            <span className="max-w-48 truncate">
              {facturaNombre ?? "Archivo cargado"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleRemoveFactura}
              aria-label="Quitar factura"
            >
              <X />
            </Button>
          </div>
        )}
      </div>

      {errorSubida && <p className="text-sm text-destructive">{errorSubida}</p>}
    </div>
  );
}
