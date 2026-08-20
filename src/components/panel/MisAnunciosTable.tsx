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

interface MisAnunciosTableProps {
  anuncios: MisAnuncioSerializado[];
}

export function MisAnunciosTable({ anuncios }: MisAnunciosTableProps) {
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
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Anuncio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Vistas</TableHead>
            <TableHead>Contactos</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {anuncios.map((anuncio) => (
            <MisAnuncioRow key={anuncio.id} anuncio={anuncio} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
