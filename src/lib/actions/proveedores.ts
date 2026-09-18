"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { RolUsuario, CategoriaProveedor } from "@generated/prisma/client";

// Public directory listing: visible providers, premium ones first.
export async function getProveedores() {
  return prisma.proveedor.findMany({
    where: { visible: true },
    orderBy: [{ premium: "desc" }, { creadoEn: "desc" }],
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

export async function listProveedoresAdmin() {
  await requireAdmin();
  return prisma.proveedor.findMany({ orderBy: { creadoEn: "desc" } });
}

export async function crearProveedor(input: {
  nombre: string;
  categoria: string;
  zonaCobertura: string;
  descripcion?: string;
  web?: string;
  logo?: string;
  premium?: boolean;
}): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const nombre = input.nombre?.trim();
  const zonaCobertura = input.zonaCobertura?.trim();
  if (!nombre) return { error: "Indica el nombre del profesional." };
  if (!zonaCobertura) return { error: "Indica la zona de cobertura." };
  if (!(input.categoria in CategoriaProveedor)) {
    return { error: "Elige una categoría válida." };
  }
  await prisma.proveedor.create({
    data: {
      nombre,
      categoria: input.categoria as CategoriaProveedor,
      zonaCobertura,
      descripcion: input.descripcion?.trim() || null,
      web: input.web?.trim() || null,
      logo: input.logo?.trim() || null,
      premium: Boolean(input.premium),
    },
  });
  revalidatePath("/admin/proveedores");
  revalidatePath("/profesionales");
  return { ok: true };
}

export async function eliminarProveedor(id: string): Promise<void> {
  await requireAdmin();
  await prisma.proveedor.delete({ where: { id } });
  revalidatePath("/admin/proveedores");
  revalidatePath("/profesionales");
}
