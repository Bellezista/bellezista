"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { EstadoAnuncio, Prisma, RolUsuario } from "@generated/prisma/client";

// Basic admin panel only (manage listings/users) -- advanced backoffice
// (stats, mass moderation, audit) is explicitly Fase 2, not built here.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { rol: true },
  });
  if (usuario?.rol !== RolUsuario.ADMIN) redirect("/catalogo");
  return user.id;
}

export async function listAnunciosAdmin() {
  await requireAdmin();
  return prisma.anuncio.findMany({
    include: { maquinaria: true, propietario: { select: { nombre: true } } },
    orderBy: { creadoEn: "desc" },
  });
}

export async function listUsuariosAdmin() {
  await requireAdmin();
  return prisma.usuario.findMany({
    include: { _count: { select: { anuncios: true } } },
    orderBy: { creadoEn: "desc" },
  });
}

export async function cambiarEstadoAnuncioAdmin(
  anuncioId: string,
  estado: EstadoAnuncio,
) {
  await requireAdmin();
  await prisma.anuncio.update({ where: { id: anuncioId }, data: { estado } });
  revalidatePath("/admin/anuncios");
  revalidatePath("/catalogo");
}

export async function eliminarAnuncioAdmin(anuncioId: string) {
  await requireAdmin();

  try {
    await prisma.anuncio.delete({ where: { id: anuncioId } });
  } catch (e) {
    // Same FK-protection reasoning as eliminarAnuncio in actions/anuncios.ts
    // -- Conversacion.anuncioId is ON DELETE RESTRICT on purpose.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return {
        error:
          "No se puede eliminar un anuncio con conversaciones activas. Cambia su estado en su lugar.",
      };
    }
    throw e;
  }

  revalidatePath("/admin/anuncios");
  revalidatePath("/catalogo");
}

export async function suspenderUsuario(usuarioId: string, suspendido: boolean) {
  await requireAdmin();
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { suspendido },
  });
  revalidatePath("/admin/usuarios");
}
