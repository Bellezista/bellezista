"use client";

import { useState } from "react";
import Link from "next/link";
import type { MisAnuncioSerializado } from "@/types/anuncio";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MisAnuncioRow } from "@/components/panel/MisAnuncioRow";
import { EliminarAnuncioModal } from "@/components/modals/EliminarAnuncioModal";
import { CambiarEstadoModal } from "@/components/modals/CambiarEstadoModal";
import { eliminarAnuncio, cambiarEstadoAnuncio } from "@/lib/actions/anuncios";

interface MisAnunciosTableProps {
  anuncios: MisAnuncioSerializado[];
}

export function MisAnunciosTable({ anuncios }: MisAnunciosTableProps) {
  // The id of the anuncio currently targeted by a pending "eliminar" or
  // "cambiar estado" action, plus which of those two modals (if any) is open.
  const [targetId, setTargetId] = useState<string | null>(null);
  const [eliminarOpen, setEliminarOpen] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);

  const targetAnuncio = anuncios.find((a) => a.id === targetId) ?? null;

  function handleEliminarClick(id: string) {
    setTargetId(id);
    setEliminarOpen(true);
  }

  function handleCambiarEstadoClick(id: string) {
    setTargetId(id);
    setEstadoOpen(true);
  }

  if (anuncios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-12 text-center">
        <p className="text-muted-foreground">
          Todavía no publicaste ningún anuncio.
        </p>
        <Button asChild variant="default">
          <Link href="/publicar">Publicar mi primer anuncio</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anuncio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vistas</TableHead>
              <TableHead>Mensajes</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anuncios.map((anuncio) => (
              <MisAnuncioRow
                key={anuncio.id}
                anuncio={anuncio}
                onEliminarClick={() => handleEliminarClick(anuncio.id)}
                onCambiarEstadoClick={() => handleCambiarEstadoClick(anuncio.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {targetAnuncio && (
        <EliminarAnuncioModal
          open={eliminarOpen}
          onOpenChange={setEliminarOpen}
          anuncioTitulo={targetAnuncio.titulo}
          onConfirm={async () => {
            await eliminarAnuncio(targetAnuncio.id);
            setEliminarOpen(false);
          }}
        />
      )}

      {targetAnuncio && (
        <CambiarEstadoModal
          key={targetAnuncio.id}
          open={estadoOpen}
          onOpenChange={setEstadoOpen}
          estadoActual={targetAnuncio.estado}
          onConfirm={async (nuevoEstado) => {
            await cambiarEstadoAnuncio(targetAnuncio.id, nuevoEstado);
            setEstadoOpen(false);
          }}
        />
      )}
    </>
  );
}
