"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import {
  BarChart3,
  Bookmark,
  CheckCircle2,
  Eye,
  ImageOff,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Share2,
  Star,
  Trash2,
} from "lucide-react";

import type { MisAnuncioSerializado } from "@/types/anuncio";
import { cn } from "@/lib/utils";
import {
  cambiarEstadoAnuncio,
  eliminarAnuncio,
} from "@/lib/actions/anuncios";
import { crearCheckoutDestacado } from "@/lib/actions/destacado";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { EstadoTexto } from "@/components/anuncio/EstadoTexto";
import { EliminarAnuncioModal } from "@/components/modals/EliminarAnuncioModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrecio } from "@/lib/format";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted";

export function MisAnuncioRow({ anuncio }: { anuncio: MisAnuncioSerializado }) {
  const router = useRouter();
  const foto = anuncio.fotos[0];
  const esTraspaso = anuncio.tipo === "TRASPASO";
  const esPausado = anuncio.estado === "RETIRADO";

  const [pending, startTransition] = useTransition();
  const [statsOpen, setStatsOpen] = useState(false);
  const [eliminarOpen, setEliminarOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);

  function setEstado(estado: "ACTIVO" | "RESERVADO" | "VENDIDO" | "RETIRADO") {
    startTransition(async () => {
      await cambiarEstadoAnuncio(anuncio.id, estado);
      router.refresh();
    });
  }

  function destacar() {
    startTransition(async () => {
      const res = await crearCheckoutDestacado(anuncio.id);
      if (res.url) window.location.href = res.url;
    });
  }

  function compartir() {
    const url = `${window.location.origin}/anuncios/${anuncio.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: anuncio.titulo, url }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  const destacadoHasta = anuncio.destacadoHasta
    ? new Date(anuncio.destacadoHasta).toLocaleDateString("es-ES")
    : null;

  return (
    <>
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
          <div className="flex items-center justify-end gap-2">
            {copiado && (
              <span className="text-xs text-gold">Enlace copiado</span>
            )}
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={destacar}
              className="gap-1.5 rounded-full bg-gold font-semibold text-foreground hover:bg-gold/90"
            >
              <Star className="size-4" aria-hidden="true" />
              {anuncio.destacado ? "Renovar premium" : "Subir a premium"}
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  disabled={pending}
                  aria-label="Acciones del anuncio"
                  className="flex size-9 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <MoreVertical className="size-5" aria-hidden="true" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  className="z-50 min-w-52 rounded-lg border border-border bg-background p-1 shadow-[var(--shadow-card)]"
                >
                  <DropdownMenu.Item asChild>
                    <Link href={`/anuncios/${anuncio.id}`} className={itemClass}>
                      <Eye className="size-4" aria-hidden="true" />
                      Ver anuncio
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      href={`/publicar/editar/${anuncio.id}`}
                      className={itemClass}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Editar
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={itemClass} onSelect={compartir}>
                    <Share2 className="size-4" aria-hidden="true" />
                    Compartir
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className={itemClass}
                    onSelect={() => setStatsOpen(true)}
                  >
                    <BarChart3 className="size-4" aria-hidden="true" />
                    Estadísticas
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 h-px bg-border" />

                  <DropdownMenu.Item
                    className={itemClass}
                    onSelect={() => setEstado(esPausado ? "ACTIVO" : "RETIRADO")}
                  >
                    {esPausado ? (
                      <>
                        <Play className="size-4" aria-hidden="true" />
                        Reanudar
                      </>
                    ) : (
                      <>
                        <Pause className="size-4" aria-hidden="true" />
                        Pausar
                      </>
                    )}
                  </DropdownMenu.Item>
                  {esTraspaso && (
                    <DropdownMenu.Item
                      className={itemClass}
                      onSelect={() => setEstado("RESERVADO")}
                    >
                      <Bookmark className="size-4" aria-hidden="true" />
                      Marcar como reservado
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item
                    className={itemClass}
                    onSelect={() => setEstado("VENDIDO")}
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    {esTraspaso ? "Marcar como traspasado" : "Marcar como vendido"}
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 h-px bg-border" />

                  <DropdownMenu.Item
                    className={cn(itemClass, "text-destructive")}
                    onSelect={() => setEliminarOpen(true)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Eliminar
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estadísticas del anuncio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-cream p-4">
                <p className="font-serif text-3xl text-foreground">
                  {anuncio.vistas.toLocaleString("es-ES")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Visualizaciones
                </p>
              </div>
              <div className="rounded-lg bg-cream p-4">
                <p className="font-serif text-3xl text-foreground">
                  {anuncio._count.conversaciones}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contactos recibidos
                </p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Publicado el{" "}
                <span className="text-foreground">
                  {new Date(anuncio.creadoEn).toLocaleDateString("es-ES")}
                </span>
              </p>
              {destacadoHasta && (
                <p className="text-muted-foreground">
                  Destacado hasta{" "}
                  <span className="text-foreground">{destacadoHasta}</span>
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EliminarAnuncioModal
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        anuncioTitulo={anuncio.titulo}
        onConfirm={async () => {
          await eliminarAnuncio(anuncio.id);
          setEliminarOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
