"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

async function getUsuarioId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getMisNotificaciones() {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return [];
  return prisma.notificacion.findMany({
    where: { usuarioId },
    orderBy: { creadoEn: "desc" },
    take: 20,
  });
}

export async function getConteoNotificaciones(): Promise<number> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return 0;
  return prisma.notificacion.count({ where: { usuarioId, leida: false } });
}

export async function marcarNotificacionesLeidas() {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return;
  await prisma.notificacion.updateMany({
    where: { usuarioId, leida: false },
    data: { leida: true },
  });
  revalidatePath("/notificaciones");
}
