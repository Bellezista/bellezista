"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { cvSchema, type CvInput } from "@/lib/validation/cvSchema";
import type { TalentoFiltros } from "@/types/talento";

async function requireUsuarioId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

// Public teaser list for the Talento catalog. Only the non-identifying fields
// (no name, no contact) -- those are behind the pay-to-access paywall.
export async function getCvs(filtros: TalentoFiltros = {}) {
  return prisma.cv.findMany({
    where: {
      visible: true,
      ...(filtros.puesto && { puesto: filtros.puesto as never }),
      ...(filtros.provincia && {
        provincia: { contains: filtros.provincia, mode: "insensitive" },
      }),
      ...(filtros.q && {
        OR: [
          { presentacion: { contains: filtros.q, mode: "insensitive" } },
          { habilidades: { contains: filtros.q, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      puesto: true,
      provincia: true,
      aniosExperiencia: true,
      jornada: true,
      disponibilidad: true,
      foto: true,
    },
    orderBy: { creadoEn: "desc" },
  });
}

export async function getCvById(id: string) {
  return prisma.cv.findUnique({
    where: { id },
    include: { usuario: { select: { nombre: true } } },
  });
}

export async function getMiCv() {
  const usuarioId = await requireUsuarioId();
  return prisma.cv.findUnique({ where: { usuarioId } });
}

// One CV per worker -- upsert keyed by usuarioId, so "create" and "edit" are
// the same flow.
export async function guardarMiCv(input: CvInput) {
  const usuarioId = await requireUsuarioId();
  const parsed = cvSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const cv = await prisma.cv.upsert({
    where: { usuarioId },
    create: { ...data, usuarioId },
    update: { ...data },
  });

  revalidatePath("/talento");
  revalidatePath("/talento/mi-cv");
  return { id: cv.id };
}
