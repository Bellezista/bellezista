"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// Value import from the pure-data enums module, not @generated/prisma/client
// -- that file also contains the PrismaClient runtime (Node-only internals),
// which breaks the client bundle if a "use client" file imports a value
// (not just a type) from it.
import { EstadoAnuncio } from "@generated/prisma/enums";
import type { AnuncioSerializado } from "@/types/anuncio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cambiarEstadoAnuncioAdmin, eliminarAnuncioAdmin } from "@/lib/actions/admin";
import { ESTADO_ANUNCIO_LABEL } from "@/lib/anuncio/labels";
import { formatPrecio } from "@/lib/format";

type AnuncioAdminRow = AnuncioSerializado & {
  propietario: { nombre: string };
};

interface AdminAnunciosTableProps {
  anuncios: AnuncioAdminRow[];
}

const ESTADOS = Object.values(EstadoAnuncio) as EstadoAnuncio[];

// Basic admin panel table (manage listings) -- no stats/moderation UI here.
// Unlike EstadoTexto (which hides ACTIVO), an admin needs to see every
// listing's status at a glance, so the plain label is rendered for every
// state including ACTIVO.
export function AdminAnunciosTable({ anuncios }: AdminAnunciosTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleEstadoChange(anuncioId: string, nuevoEstado: EstadoAnuncio) {
    startTransition(() => {
      cambiarEstadoAnuncioAdmin(anuncioId, nuevoEstado);
      router.refresh();
    });
  }

  function handleEliminar(anuncioId: string) {
    if (!window.confirm("¿Eliminar este anuncio?")) return;
    startTransition(async () => {
      const resultado = await eliminarAnuncioAdmin(anuncioId);
      if (resultado?.error) {
        window.alert(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  if (anuncios.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No hay anuncios publicados todavía.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Foto</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Propietario</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {anuncios.map((anuncio) => {
          const portada = anuncio.fotos[0];

          return (
            <TableRow key={anuncio.id}>
              <TableCell>
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {portada ? (
                    <Image
                      src={portada}
                      alt={anuncio.titulo}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-[0.6rem] text-muted-foreground">
                        Sin foto
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-52 truncate whitespace-normal font-medium text-foreground">
                {anuncio.titulo}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {anuncio.propietario.nombre}
              </TableCell>
              <TableCell className="text-foreground">
                {ESTADO_ANUNCIO_LABEL[anuncio.estado]}
              </TableCell>
              <TableCell className="text-foreground">
                {formatPrecio(anuncio.precio.toString())}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Select
                    value={anuncio.estado}
                    onValueChange={(value) =>
                      handleEstadoChange(anuncio.id, value as EstadoAnuncio)
                    }
                  >
                    <SelectTrigger size="sm" aria-label="Cambiar estado">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {ESTADO_ANUNCIO_LABEL[estado]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleEliminar(anuncio.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
