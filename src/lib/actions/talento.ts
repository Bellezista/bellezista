"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { cvSchema, type CvInput } from "@/lib/validation/cvSchema";
import { tecnicasDePuesto } from "@/lib/talento/cv-tecnicas";
import { enviarEmail } from "@/lib/email/enviar";
import { emailBienvenidaTalento } from "@/lib/email/plantillas";
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
          { titulacion: { contains: filtros.q, mode: "insensitive" } },
          { cursos: { contains: filtros.q, mode: "insensitive" } },
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
    include: {
      usuario: { select: { nombre: true } },
      tecnicas: { orderBy: { tecnica: "asc" } },
    },
  });
}

export async function getMiCv() {
  const usuarioId = await requireUsuarioId();
  return prisma.cv.findUnique({
    where: { usuarioId },
    include: { tecnicas: true },
  });
}

// One CV per worker -- upsert keyed by usuarioId, so "create" and "edit" are
// the same flow. The technique block is replaced wholesale on each save and
// filtered to the keys valid for the selected puesto.
export async function guardarMiCv(input: CvInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const usuarioId = user.id;

  const parsed = cvSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { tecnicas, ...scalars } = parsed.data;

  // First publish? (Cv didn't exist yet) -> send the Talento welcome email.
  const yaTenia = await prisma.cv.findUnique({
    where: { usuarioId },
    select: { id: true },
  });

  const clavesValidas = new Set(
    tecnicasDePuesto(scalars.puesto).map((t) => t.key),
  );
  const tecnicasLimpias = tecnicas.filter((t) => clavesValidas.has(t.key));

  const cv = await prisma.$transaction(async (tx) => {
    const guardado = await tx.cv.upsert({
      where: { usuarioId },
      create: { ...scalars, usuarioId },
      update: { ...scalars },
    });
    await tx.cvTecnica.deleteMany({ where: { cvId: guardado.id } });
    if (tecnicasLimpias.length > 0) {
      await tx.cvTecnica.createMany({
        data: tecnicasLimpias.map((t) => ({
          cvId: guardado.id,
          tecnica: t.key,
          anios: t.anios,
        })),
      });
    }
    return guardado;
  });

  if (!yaTenia && user.email) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true },
    });
    const { subject, html } = emailBienvenidaTalento(usuario?.nombre ?? "Bienvenido");
    const destino = user.email;
    after(async () => {
      try {
        await enviarEmail(destino, subject, html);
      } catch (e) {
        console.error("No se pudo enviar el email de bienvenida (talento):", e);
      }
    });
  }

  revalidatePath("/talento");
  revalidatePath("/talento/mi-cv");
  return { id: cv.id };
}
