"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import {
  publicarMaquinariaSchema,
  type PublicarMaquinariaInput,
} from "@/lib/validation/publicarMaquinariaSchema";
import { EstadoAnuncio, Prisma, TipoAnuncio } from "@generated/prisma/client";
// CatalogoFiltros is defined in src/types/anuncio.ts (a plain module, no
// "use server" directive) and NOT re-exported from here -- client-bundled
// code must import it from there directly, never from this file (see that
// module's comment for why).
import { serializeAnuncios, type CatalogoFiltros } from "@/types/anuncio";

// Every Server Function here is reachable via a direct POST request, not just
// through the UI (see the plan's Next.js 16 addendum) -- every mutation
// re-derives the current user from the session itself, never trusts a
// client-supplied usuarioId/anuncioId ownership claim.
async function requireUsuarioId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

// Serializes (Decimal -> number) before returning, not just at the page
// level -- this function is called directly by client code (CatalogoClient's
// refetch), and a Server Action's RETURN VALUE crosses the same
// React-serialization boundary as a Server Component prop the instant it's
// invoked via that client-side RPC path. Confirmed live: the page-level
// serialization alone didn't stop the "Decimal objects are not supported"
// warning from recurring on every filter-triggered refetch.
export async function getAnunciosMaquinaria(filtros: CatalogoFiltros = {}) {
  const anuncios = await prisma.anuncio.findMany({
    where: {
      tipo: TipoAnuncio.MAQUINARIA,
      estado: { not: EstadoAnuncio.RETIRADO },
      ...(filtros.ciudad && {
        ciudadProvincia: { contains: filtros.ciudad, mode: "insensitive" },
      }),
      ...(filtros.q && {
        titulo: { contains: filtros.q, mode: "insensitive" },
      }),
      ...((filtros.categoria || filtros.marca) && {
        maquinaria: {
          ...(filtros.categoria && {
            categoria: filtros.categoria as never,
          }),
          ...(filtros.marca && {
            marca: { contains: filtros.marca, mode: "insensitive" },
          }),
        },
      }),
    },
    include: { maquinaria: true },
    orderBy: { creadoEn: "desc" },
  });
  return serializeAnuncios(anuncios);
}

export async function getAnuncioById(id: string) {
  return prisma.anuncio.findUnique({
    where: { id },
    include: { maquinaria: true, propietario: true },
  });
}

export async function getMisAnuncios() {
  const usuarioId = await requireUsuarioId();
  const anuncios = await prisma.anuncio.findMany({
    where: { propietarioId: usuarioId },
    include: {
      maquinaria: true,
      _count: { select: { conversaciones: true } },
    },
    orderBy: { creadoEn: "desc" },
  });
  // Same reason as getAnunciosMaquinaria above -- called directly from a
  // client hook (useMisAnuncios), so this must return already-serialized data.
  return serializeAnuncios(anuncios).map((a, i) => ({
    ...a,
    _count: anuncios[i]._count,
  }));
}

export async function crearAnuncioMaquinaria(input: PublicarMaquinariaInput) {
  const usuarioId = await requireUsuarioId();
  const parsed = publicarMaquinariaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const {
    titulo,
    precio,
    ciudadProvincia,
    fotos,
    video,
    factura,
    aceptaCondiciones: _aceptaCondiciones,
    ...maquinariaData
  } = parsed.data;

  const anuncio = await prisma.anuncio.create({
    data: {
      tipo: TipoAnuncio.MAQUINARIA,
      titulo,
      precio,
      ciudadProvincia,
      fotos,
      propietarioId: usuarioId,
      maquinaria: { create: { ...maquinariaData, video, factura } },
    },
  });

  revalidatePath("/catalogo");
  revalidatePath("/mis-anuncios");
  // Called from a client-side mutation (the wizard), not a plain <form
  // action> -- return the id and let the caller navigate (router.push)
  // instead of calling redirect() here, since the special redirect exception
  // doesn't reliably propagate through an arbitrary mutation wrapper.
  return { id: anuncio.id };
}

export async function actualizarAnuncioMaquinaria(
  anuncioId: string,
  input: PublicarMaquinariaInput,
) {
  const usuarioId = await requireUsuarioId();
  const existing = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { propietarioId: true },
  });
  if (!existing || existing.propietarioId !== usuarioId) {
    return { error: "No tienes permiso para editar este anuncio." };
  }

  const parsed = publicarMaquinariaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const {
    titulo,
    precio,
    ciudadProvincia,
    fotos,
    video,
    factura,
    aceptaCondiciones: _aceptaCondiciones,
    ...maquinariaData
  } = parsed.data;

  await prisma.anuncio.update({
    where: { id: anuncioId },
    data: {
      titulo,
      precio,
      ciudadProvincia,
      fotos,
      maquinaria: { update: { ...maquinariaData, video, factura } },
    },
  });

  revalidatePath("/catalogo");
  revalidatePath("/mis-anuncios");
  revalidatePath(`/anuncios/${anuncioId}`);
  return { id: anuncioId };
}

export async function cambiarEstadoAnuncio(
  anuncioId: string,
  estado: EstadoAnuncio,
) {
  const usuarioId = await requireUsuarioId();
  const existing = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { propietarioId: true },
  });
  if (!existing || existing.propietarioId !== usuarioId) {
    return { error: "No tienes permiso para modificar este anuncio." };
  }
  await prisma.anuncio.update({ where: { id: anuncioId }, data: { estado } });
  revalidatePath("/catalogo");
  revalidatePath("/mis-anuncios");
}

export async function eliminarAnuncio(anuncioId: string) {
  const usuarioId = await requireUsuarioId();
  const existing = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { propietarioId: true },
  });
  if (!existing || existing.propietarioId !== usuarioId) {
    return { error: "No tienes permiso para eliminar este anuncio." };
  }

  try {
    await prisma.anuncio.delete({ where: { id: anuncioId } });
  } catch (e) {
    // Conversacion.anuncioId is ON DELETE RESTRICT, deliberately -- deleting
    // a listing must never silently wipe out the interesado's side of a
    // conversation they didn't consent to losing. P2003 = FK constraint
    // violation (Prisma's code, not a Postgres one), the only realistic
    // cause of this delete failing.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return {
        error:
          "No puedes eliminar un anuncio con conversaciones activas. Usa \"Cambiar estado\" para retirarlo en su lugar.",
      };
    }
    throw e;
  }

  revalidatePath("/catalogo");
  revalidatePath("/mis-anuncios");
}
