"use client";

import * as React from "react";

// Value import from the pure-data enums module, not @generated/prisma/client
// -- that file also contains the PrismaClient runtime (Node-only internals),
// which breaks the client bundle if a "use client" file imports a value
// (not just a type) from it.
import { EstadoAnuncio } from "@generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADO_ANUNCIO_LABEL } from "@/lib/anuncio/labels";

interface CambiarEstadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estadoActual: EstadoAnuncio;
  onConfirm: (nuevoEstado: EstadoAnuncio) => void | Promise<void>;
}

const ESTADOS = Object.values(EstadoAnuncio);

export function CambiarEstadoModal({
  open,
  onOpenChange,
  estadoActual,
  onConfirm,
}: CambiarEstadoModalProps) {
  // No effect-based reset here on purpose (that triggers cascading renders,
  // per the react-hooks/set-state-in-effect rule) -- the parent must render
  // this with a `key` tied to the target anuncio's id so switching targets
  // remounts the component and re-initializes this state naturally.
  const [nuevoEstado, setNuevoEstado] =
    React.useState<EstadoAnuncio>(estadoActual);
  const [isPending, setIsPending] = React.useState(false);

  async function handleConfirm() {
    setIsPending(true);
    try {
      await onConfirm(nuevoEstado);
    } finally {
      setIsPending(false);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar estado del anuncio</DialogTitle>
        </DialogHeader>
        <Select
          value={nuevoEstado}
          onValueChange={(value) => setNuevoEstado(value as EstadoAnuncio)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccioná un estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {ESTADO_ANUNCIO_LABEL[estado]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button variant="default" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
