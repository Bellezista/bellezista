"use client";

import { ConfirmDialog } from "@/components/modals/ConfirmDialog";

interface EliminarAnuncioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anuncioTitulo: string;
  onConfirm: () => void | Promise<void>;
}

export function EliminarAnuncioModal({
  open,
  onOpenChange,
  anuncioTitulo,
  onConfirm,
}: EliminarAnuncioModalProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar anuncio"
      description={`¿Seguro que quieres eliminar "${anuncioTitulo}"? Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar"
      destructive
      onConfirm={onConfirm}
    />
  );
}
