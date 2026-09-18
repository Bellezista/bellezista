"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { crearEvento, eliminarEvento } from "@/lib/actions/eventos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EventoView {
  id: string;
  titulo: string;
  ciudad: string | null;
  modalidad: string | null;
  fecha: string;
}

export function EventosAdmin({ eventos }: { eventos: EventoView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [modalidad, setModalidad] = useState("Presencial");
  const [url, setUrl] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await crearEvento({ titulo, fecha, ciudad, modalidad, url });
      if (res.error) return setError(res.error);
      setTitulo("");
      setFecha("");
      setCiudad("");
      setUrl("");
      router.refresh();
    });
  }

  function borrar(id: string) {
    startTransition(async () => {
      await eliminarEvento(id);
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
          <Label htmlFor="titulo">Título del evento</Label>
          <Input id="titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Barcelona" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modalidad">Modalidad</Label>
          <select
            id="modalidad"
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none"
          >
            <option>Presencial</option>
            <option>Online</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="url">Enlace (opcional)</Label>
          <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending} className="bg-gold font-semibold text-foreground hover:bg-gold/90">
            Añadir evento
          </Button>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
      </form>

      <div className="space-y-2">
        {eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay eventos.</p>
        ) : (
          eventos.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-3.5"
            >
              <div>
                <p className="font-medium text-foreground">{ev.titulo}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(ev.fecha).toLocaleDateString("es-ES")}
                  {ev.ciudad ? ` · ${ev.ciudad}` : ""}
                  {ev.modalidad ? ` · ${ev.modalidad}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => borrar(ev.id)}
                disabled={pending}
                aria-label="Eliminar evento"
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
