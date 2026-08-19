"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import type { SeccionAlerta } from "@generated/prisma/enums";

async function getUsuarioId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function crearAlerta(
  seccion: SeccionAlerta,
  filtros: Record<string, string>,
): Promise<{ ok?: boolean; error?: string }> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "NO_AUTH" };

  await prisma.alerta.create({ data: { usuarioId, seccion, filtros } });
  revalidatePath("/perfil");
  return { ok: true };
}

export async function getMisAlertas() {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return [];
  return prisma.alerta.findMany({
    where: { usuarioId },
    orderBy: { creadoEn: "desc" },
  });
}

export async function borrarAlerta(
  id: string,
): Promise<{ ok?: boolean; error?: string }> {
  const usuarioId = await getUsuarioId();
  if (!usuarioId) return { error: "NO_AUTH" };
  await prisma.alerta.deleteMany({ where: { id, usuarioId } });
  revalidatePath("/perfil");
  return { ok: true };
}
