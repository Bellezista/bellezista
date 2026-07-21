"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { MisAnuncioSerializado } from "@/types/anuncio";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { EstadoTexto } from "@/components/anuncio/EstadoTexto";
import { formatPrecio } from "@/lib/format";

interface MisAnuncioRowProps {
  anuncio: MisAnuncioSerializado;
  onEliminarClick: () => void;
  onCambiarEstadoClick: () => void;
}

// Rendered inside a <TableBody> owned by MisAnunciosTable -- this file only
// renders the <TableRow>, not the surrounding Table/TableBody.
export function MisAnuncioRow({
  anuncio,
  onEliminarClick,
  onCambiarEstadoClick,
}: MisAnuncioRowProps) {
  const foto = anuncio.fotos[0];

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
            {foto ? (
              <Image
                src={foto}
                alt={anuncio.titulo}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageOff className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{anuncio.titulo}</p>
            <p className="truncate text-sm text-muted-foreground">
              {anuncio.ciudadProvincia}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <EstadoTexto estado={anuncio.estado} />
      </TableCell>
      <TableCell>{anuncio.vistas.toLocaleString("es-MX")}</TableCell>
      <TableCell>{anuncio._count.conversaciones}</TableCell>
      <TableCell>{formatPrecio(anuncio.precio.toString())}</TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/publicar/editar/${anuncio.id}`}>Editar</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onCambiarEstadoClick}>
            Cambiar estado
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={onEliminarClick}
          >
            Eliminar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
