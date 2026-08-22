"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageOff, ShieldCheck, TriangleAlert } from "lucide-react";

import { liberarOperacion, abrirIncidencia } from "@/lib/actions/operacion";
import { formatPrecio } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ESTADO_OPERACION_LABEL,
  ESTADO_OPERACION_TONO,
  type TonoEstado,
} from "@/lib/operacion/labels";
import type { EstadoOperacion } from "@generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TONO_CLASE: Record<TonoEstado, string> = {
  neutro: "bg-muted text-muted-foreground",
  activo: "bg-gold/15 text-foreground",
  exito: "bg-emerald-100 text-emerald-800",
  alerta: "bg-red-100 text-red-800",
};

export interface CompraView {
  id: string;
  estadoOperacion: EstadoOperacion;
  precioFinal: string | null;
  fechaPago: string | null;
  plazoRevision: number | null;
  anuncio: { id: string; titulo: string; fotos: string[] } | null;
}

export function CompraRow({ compra }: { compra: CompraView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [incidenciaOpen, setIncidenciaOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const foto = compra.anuncio?.fotos[0];
  const enRevision = compra.estadoOperacion === "PAGADO_EN_REVISION";

  const fechaLimite =
    compra.fechaPago && compra.plazoRevision
      ? new Date(
          new Date(compra.fechaPago).getTime() +
            compra.plazoRevision * 24 * 60 * 60 * 1000,
        ).toLocaleDateString("es-ES")
      : null;

  function confirmar() {
    setError(null);
    startTransition(async () => {
      const res = await liberarOperacion(compra.id);
      if (res.error) return setError(res.error);
      router.refresh();
    });
  }

  function enviarIncidencia() {
    setError(null);
    startTransition(async () => {
      const res = await abrirIncidencia(compra.id, motivo);
      if (res.error) return setError(res.error);
      setIncidenciaOpen(false);
      setMotivo("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {foto ? (
          <Image src={foto} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {compra.anuncio ? (
          <Link
            href={`/anuncios/${compra.anuncio.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {compra.anuncio.titulo}
          </Link>
        ) : (
          <p className="font-medium text-muted-foreground">Anuncio no disponible</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
              TONO_CLASE[ESTADO_OPERACION_TONO[compra.estadoOperacion]],
            )}
          >
            {ESTADO_OPERACION_LABEL[compra.estadoOperacion]}
          </span>
          {compra.precioFinal && (
            <span className="text-sm text-muted-foreground">
              {formatPrecio(compra.precioFinal)}
            </span>
          )}
        </div>
        {enRevision && fechaLimite && (
          <p className="mt-1 text-xs text-muted-foreground">
            Si no confirmas antes del {fechaLimite}, el pago se liberará
            automáticamente al vendedor.
          </p>
        )}
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>

      {enRevision && (
        <div className="flex shrink-0 flex-col gap-2 sm:w-52">
          <Button
            type="button"
            disabled={pending}
            onClick={confirmar}
            className="gap-2 rounded-full bg-gold font-semibold text-foreground hover:bg-gold/90"
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            Confirmar recepción
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setIncidenciaOpen(true)}
            className="gap-2 rounded-full"
          >
            <TriangleAlert className="size-4" aria-hidden="true" />
            Tengo un problema
          </Button>
        </div>
      )}

      <Dialog open={incidenciaOpen} onOpenChange={setIncidenciaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir una incidencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Cuéntanos qué ha pasado. El pago seguirá retenido y lo revisaremos
              contigo y con el vendedor.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              placeholder="Describe el problema..."
              className="w-full rounded-lg border border-input bg-background p-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIncidenciaOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={pending || motivo.trim().length === 0}
                onClick={enviarIncidencia}
              >
                Enviar incidencia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
