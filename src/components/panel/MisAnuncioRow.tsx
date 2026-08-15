"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Star } from "lucide-react";
import type { MisAnuncioSerializado } from "@/types/anuncio";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { EstadoTexto } from "@/components/anuncio/EstadoTexto";
import { crearCheckoutDestacado } from "@/lib/actions/destacado";
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
  const [destacarPending, startDestacar] = useTransition();

  function handleDestacar() {
    startDestacar(async () => {
      const res = await crearCheckoutDestacado(anuncio.id);
      if (res.url) window.location.href = res.url;
    });
  }

  const destacadoHasta = anuncio.destacadoHasta
    ? new Date(anuncio.destacadoHasta).toLocaleDateString("es-ES")
    : null;

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
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{anuncio.titulo}</p>
              {anuncio.destacado && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                  <Star className="size-3" aria-hidden="true" />
                  Destacado
                </span>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {anuncio.ciudadProvincia}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <EstadoTexto estado={anuncio.estado} />
      </TableCell>
      <TableCell>{anuncio.vistas.toLocaleString("es-ES")}</TableCell>
      <TableCell>{anuncio._count.conversaciones}</TableCell>
      <TableCell>{formatPrecio(anuncio.precio.toString())}</TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gold text-gold hover:bg-gold hover:text-foreground"
            disabled={destacarPending}
            onClick={handleDestacar}
            title={
              destacadoHasta ? `Destacado hasta ${destacadoHasta}` : undefined
            }
          >
            {anuncio.destacado ? "Renovar destacado" : "Destacar"}
          </Button>
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
