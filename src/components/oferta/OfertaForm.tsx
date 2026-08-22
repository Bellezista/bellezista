"use client";

import { type ChangeEvent, useState, useTransition } from "react";
import Image from "next/image";
import { ImageUp, Loader2, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { crearOfertaCheckout } from "@/lib/actions/oferta";
import { OFERTA_PRECIOS } from "@/lib/oferta/precios";
import { TIPO_NEGOCIO_TRASPASO_LABEL } from "@/lib/anuncio/labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TipoNegocioTraspaso, VigenciaOferta } from "@generated/prisma/enums";

const CATEGORIAS = Object.entries(TIPO_NEGOCIO_TRASPASO_LABEL) as [
  TipoNegocioTraspaso,
  string,
][];

const euros = (c: number) => `${(c / 100).toLocaleString("es-ES")} €`;

async function subirFoto(file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión expirada.");
  const ext = file.name.split(".").pop();
  const path = `${user.id}/oferta-${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
  const { error } = await supabase.storage.from("fotos-video").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("fotos-video").getPublicUrl(path).data.publicUrl;
}

export function OfertaForm() {
  const [pending, startTransition] = useTransition();
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocioTraspaso>(
    CATEGORIAS[0][0],
  );
  const [ciudadProvincia, setCiudadProvincia] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [vigencia, setVigencia] = useState<VigenciaOferta>("SEMANAL");

  async function handleFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setSubiendo(true);
    try {
      setFoto(await subirFoto(file));
    } catch {
      setError("No se pudo subir la foto. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!foto) {
      setError("Añade una foto a la oferta.");
      return;
    }
    startTransition(async () => {
      const res = await crearOfertaCheckout({
        titulo,
        descripcion,
        precio: Number(precio),
        precioOriginal: precioOriginal ? Number(precioOriginal) : null,
        tipoNegocio,
        foto,
        whatsapp,
        ciudadProvincia: ciudadProvincia || null,
        vigencia,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.url) window.location.href = res.url;
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          required
          maxLength={80}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="-30% en Depilación Láser"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción breve</Label>
        <textarea
          id="descripcion"
          required
          maxLength={280}
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Explica en qué consiste la oferta o el pack."
          className="w-full rounded-lg border border-input bg-background p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="precio">Precio con descuento (€)</Label>
          <Input
            id="precio"
            type="number"
            min="0"
            step="0.01"
            required
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="49"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="precioOriginal">Precio original (opcional)</Label>
          <Input
            id="precioOriginal"
            type="number"
            min="0"
            step="0.01"
            value={precioOriginal}
            onChange={(e) => setPrecioOriginal(e.target.value)}
            placeholder="70"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tipoNegocio">Tipo de negocio</Label>
          <select
            id="tipoNegocio"
            value={tipoNegocio}
            onChange={(e) => setTipoNegocio(e.target.value as TipoNegocioTraspaso)}
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {CATEGORIAS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ciudad">Ciudad / provincia (opcional)</Label>
          <Input
            id="ciudad"
            value={ciudadProvincia}
            onChange={(e) => setCiudadProvincia(e.target.value)}
            placeholder="Barcelona"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp">WhatsApp de contacto</Label>
        <Input
          id="whatsapp"
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+34 600 111 222"
        />
        <p className="text-xs text-muted-foreground">
          Con prefijo del país. Es el número al que escribirán los clientes.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Foto</Label>
        {foto ? (
          <div className="relative aspect-[16/10] w-full max-w-xs overflow-hidden rounded-lg border border-border">
            <Image src={foto} alt="Foto de la oferta" fill sizes="320px" className="object-cover" />
            <button
              type="button"
              onClick={() => setFoto(null)}
              className="absolute right-2 top-2 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground hover:text-destructive"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <label
            htmlFor="foto-input"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-cream/50 px-6 py-8 text-center hover:border-gold hover:bg-cream"
          >
            {subiendo ? (
              <Loader2 className="size-6 animate-spin text-gold" />
            ) : (
              <ImageUp className="size-7 text-gold" aria-hidden="true" />
            )}
            <span className="text-sm font-medium text-foreground">
              {subiendo ? "Subiendo..." : "Haz clic para subir una foto"}
            </span>
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              disabled={subiendo}
              onChange={handleFoto}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label>Duración de la oferta</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["DIARIA", "SEMANAL"] as VigenciaOferta[]).map((v) => {
            const cfg = OFERTA_PRECIOS[v];
            const activo = vigencia === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVigencia(v)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-4 text-left transition-colors",
                  activo
                    ? "border-2 border-gold bg-gold/10"
                    : "border-border hover:border-gold/50",
                )}
              >
                <span className="font-semibold text-foreground">
                  {v === "DIARIA" ? "1 día" : "1 semana"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {euros(cfg.importe)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={pending || subiendo}
        className="h-12 w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
      >
        <ShieldCheck className="size-4" aria-hidden="true" />
        {pending ? "Redirigiendo al pago..." : "Publicar y pagar"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Tu oferta se publica con su propia página para compartir en cuanto se
        confirma el pago.
      </p>
    </form>
  );
}
