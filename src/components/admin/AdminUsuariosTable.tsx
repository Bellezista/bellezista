"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Usuario } from "@generated/prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { suspenderUsuario } from "@/lib/actions/admin";

type UsuarioAdminRow = Usuario & { _count: { anuncios: number } };

interface AdminUsuariosTableProps {
  usuarios: UsuarioAdminRow[];
}

// Basic admin panel table (manage users) -- no stats/audit UI here.
export function AdminUsuariosTable({ usuarios }: AdminUsuariosTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleToggleSuspendido(usuarioId: string, suspenderA: boolean) {
    startTransition(() => {
      suspenderUsuario(usuarioId, suspenderA);
      router.refresh();
    });
  }

  if (usuarios.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No hay usuarios registrados todavía.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Anuncios</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.id}>
            <TableCell className="font-medium text-foreground">
              {usuario.nombre}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {usuario.rol === "ADMIN" ? "Administrador" : "Usuario"}
            </TableCell>
            <TableCell
              className={
                usuario.suspendido ? "text-destructive" : "text-foreground"
              }
            >
              {usuario.suspendido ? "Suspendido" : "Activo"}
            </TableCell>
            <TableCell className="text-foreground">
              {usuario._count.anuncios}
            </TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleToggleSuspendido(usuario.id, !usuario.suspendido)
                }
              >
                {usuario.suspendido ? "Reactivar" : "Suspender"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
