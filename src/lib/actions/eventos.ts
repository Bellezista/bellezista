"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { RolUsuario } from "@generated/prisma/client";

// Upcoming sector events for the portada + Actualidad. Real data only, added
// from the admin panel.
export async function getProximosEventos(limite = 3) {
  return prisma.evento.findMany({
    where: { fecha: { gte: new Date() } },
    orderBy: { fecha: "asc" },
    take: limite,
  });
}

async function requireAdmin(): Promise<void> {
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
}

export async function listEventosAdmin() {
  await requireAdmin();
  return prisma.evento.findMany({ orderBy: { fecha: "asc" } });
}

export async function crearEvento(input: {
  titulo: string;
  fecha: string;
  ciudad?: string;
  modalidad?: string;
  url?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const titulo = input.titulo?.trim();
  const fecha = input.fecha ? new Date(input.fecha) : null;
  if (!titulo) return { error: "Indica el título del evento." };
  if (!fecha || Number.isNaN(fecha.getTime())) {
    return { error: "Indica una fecha válida." };
  }
  await prisma.evento.create({
    data: {
      titulo,
      fecha,
      ciudad: input.ciudad?.trim() || null,
      modalidad: input.modalidad?.trim() || null,
      url: input.url?.trim() || null,
    },
  });
  revalidatePath("/admin/eventos");
  revalidatePath("/");
  return { ok: true };
}

export async function eliminarEvento(id: string): Promise<void> {
  await requireAdmin();
  await prisma.evento.delete({ where: { id } });
  revalidatePath("/admin/eventos");
  revalidatePath("/");
}
