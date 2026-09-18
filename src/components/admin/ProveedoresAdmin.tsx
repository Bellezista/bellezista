"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { crearProveedor, eliminarProveedor } from "@/lib/actions/proveedores";
import { CATEGORIA_PROVEEDOR_LABEL } from "@/lib/proveedor/categorias";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProveedorView {
  id: string;
  nombre: string;
  categoria: string;
  zonaCobertura: string;
  premium: boolean;
}

const CATEGORIAS = Object.entries(CATEGORIA_PROVEEDOR_LABEL) as [string, string][];

export function ProveedoresAdmin({
  proveedores,
}: {
  proveedores: ProveedorView[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0][0]);
  const [zonaCobertura, setZonaCobertura] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [web, setWeb] = useState("");
  const [logo, setLogo] = useState("");
  const [premium, setPremium] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await crearProveedor({
        nombre,
        categoria,
        zonaCobertura,
        descripcion,
        web,
        logo,
        premium,
      });
      if (res.error) return setError(res.error);
      setNombre("");
      setZonaCobertura("");
      setDescripcion("");
      setWeb("");
      setLogo("");
      setPremium(false);
      router.refresh();
    });
  }

  function borrar(id: string) {
    startTransition(async () => {
      await eliminarProveedor(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-2"
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoría</Label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {CATEGORIAS.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="zona">Zona de cobertura</Label>
          <Input id="zona" required value={zonaCobertura} onChange={(e) => setZonaCobertura(e.target.value)} placeholder="Toda España / Barcelona" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="web">Web</Label>
          <Input id="web" value={web} onChange={(e) => setWeb(e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="logo">Logo (URL)</Label>
          <Input id="logo" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://" />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-foreground sm:col-span-2">
          <input
            type="checkbox"
            className="size-4 accent-gold"
            checked={premium}
            onChange={(e) => setPremium(e.target.checked)}
          />
          Plan Premium (badge destacado)
        </label>
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Añadir profesional"}
          </Button>
        </div>
      </form>

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {proveedores.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Aún no hay profesionales.
          </p>
        ) : (
          proveedores.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-foreground">
                  {p.nombre}
                  {p.premium && (
                    <span className="ml-2 rounded-sm bg-gold px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-foreground">
                      Premium
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORIA_PROVEEDOR_LABEL[p.categoria as keyof typeof CATEGORIA_PROVEEDOR_LABEL]}{" "}
                  · {p.zonaCobertura}
                </p>
              </div>
              <button
                type="button"
                aria-label="Eliminar"
                onClick={() => borrar(p.id)}
                disabled={pending}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
