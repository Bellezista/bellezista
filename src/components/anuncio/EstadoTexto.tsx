import type { EstadoAnuncio } from "@generated/prisma/client";
import { ESTADO_ANUNCIO_LABEL } from "@/lib/anuncio/labels";

interface EstadoTextoProps {
  estado: EstadoAnuncio;
}

// Plain, muted text -- never a colored pill/badge (see CLAUDE.md's visual
// direction: no colored badges anywhere). ACTIVO is the default/expected
// state for a listing, so it needs no callout at all.
export function EstadoTexto({ estado }: EstadoTextoProps) {
  if (estado === "ACTIVO") {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span aria-hidden="true" className="size-1 rounded-full bg-muted-foreground" />
      {ESTADO_ANUNCIO_LABEL[estado]}
    </span>
  );
}
