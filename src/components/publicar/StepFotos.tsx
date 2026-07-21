"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { FileText, ImageIcon, Video as VideoIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicarMaquinariaFormInput } from "@/lib/validation/publicarMaquinariaSchema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
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
  // itself only stores the blob URL string, not the original filename).
  const [videoNombre, setVideoNombre] = useState<string | null>(null);
  const [facturaNombre, setFacturaNombre] = useState<string | null>(null);

  function handleFotosChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    // TODO: replace local blob URLs with real Supabase Storage upload paths once the bucket is wired up (see supabase/migrations/0004_storage_buckets.sql).
    const nuevasUrls = files.map((file) => URL.createObjectURL(file));
    setValue("fotos", [...fotos, ...nuevasUrls], { shouldValidate: true });
    event.target.value = "";
  }

  function handleRemoveFoto(index: number) {
    setValue(
      "fotos",
      fotos.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  }

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue("video", URL.createObjectURL(file), { shouldValidate: true });
    setVideoNombre(file.name);
    event.target.value = "";
  }

  function handleRemoveVideo() {
    setValue("video", undefined, { shouldValidate: true });
    setVideoNombre(null);
  }

  function handleFacturaChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue("factura", URL.createObjectURL(file), { shouldValidate: true });
    setFacturaNombre(file.name);
    event.target.value = "";
  }

  function handleRemoveFactura() {
    setValue("factura", undefined, { shouldValidate: true });
    setFacturaNombre(null);
  }

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl">Fotos y video</h2>

      <div className="space-y-3">
        <Label htmlFor="fotos-input">Fotos</Label>
        <Input
          id="fotos-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFotosChange}
        />
        <FieldError message={errors.fotos?.message} />

        {fotos.length > 0 ? (
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
                  unoptimized
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
          </div>
        ) : (
          <div className="flex aspect-[3/1] items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground">
            <ImageIcon className="size-4" />
            Todavía no subiste fotos
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="video-input">Video (opcional)</Label>
        <Input
          id="video-input"
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />
        {video && (
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
          onChange={handleFacturaChange}
        />
        {factura && (
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
    </div>
  );
}
