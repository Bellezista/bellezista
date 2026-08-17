"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarDatosKit, type DatosKit } from "@/lib/actions/kitTraspaso";
import { FotosField } from "@/components/publicar/FotosField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const VACIO: DatosKit = {
  negocio: "",
  cedente: "",
  cesionario: "",
  precioYPago: "",
  reservaYCuenta: "",
  fechaFirma: "",
  alquiler: "",
  notas: "",
};

export function DatosKitForm({ kitId }: { kitId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);
  const [form, setForm] = useState<DatosKit>(VACIO);

  function set<K extends keyof DatosKit>(k: K, v: DatosKit[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await guardarDatosKit(kitId, form, fotos);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="negocio">Datos del negocio</Label>
        <Textarea
          id="negocio"
          required
          rows={2}
          placeholder="Nombre comercial, dirección y actividad."
          value={form.negocio}
          onChange={(e) => set("negocio", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cedente">Parte Cedente (quien vende)</Label>
          <Textarea
            id="cedente"
            required
            rows={3}
            placeholder="Nombre, DNI/CIF y domicilio."
            value={form.cedente}
            onChange={(e) => set("cedente", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cesionario">Cesionario / comprador</Label>
          <Textarea
            id="cesionario"
            required
            rows={3}
            placeholder="Nombre, DNI/NIE y domicilio."
            value={form.cesionario}
            onChange={(e) => set("cesionario", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="precioYPago">Precio del traspaso y forma de pago</Label>
        <Input
          id="precioYPago"
          required
          placeholder="Ej: 15.900 € — 3.000 € de reserva y el resto a la firma."
          value={form.precioYPago}
          onChange={(e) => set("precioYPago", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reservaYCuenta">
          Reserva / señal y cuenta bancaria de destino
        </Label>
        <Textarea
          id="reservaYCuenta"
          required
          rows={2}
          placeholder="Importe de la señal e IBAN donde recibirla."
          value={form.reservaYCuenta}
          onChange={(e) => set("reservaYCuenta", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fechaFirma">Fecha máxima para la firma</Label>
          <Input
            id="fechaFirma"
            type="date"
            required
            value={form.fechaFirma}
            onChange={(e) => set("fechaFirma", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alquiler">Condiciones del alquiler actual</Label>
          <Input
            id="alquiler"
            required
            placeholder="Importe mensual y si está pendiente de aceptación."
            value={form.alquiler}
            onChange={(e) => set("alquiler", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas adicionales (opcional)</Label>
        <Textarea
          id="notas"
          rows={2}
          placeholder="Cualquier detalle relevante para tu operación."
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Fotos del negocio</Label>
        <FotosField fotos={fotos} onChange={setFotos} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar datos"}
      </Button>
    </form>
  );
}
