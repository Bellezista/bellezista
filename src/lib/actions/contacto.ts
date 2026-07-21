"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

// The ONLY file in the codebase allowed to query the Contacto model (see the
// plan's security section). Always filtered server-side by the current
// session's own id -- never accepts a usuarioId argument from a caller.

async function requireUsuarioId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

export async function getMiContacto() {
  const usuarioId = await requireUsuarioId();
  return prisma.contacto.findUnique({ where: { usuarioId } });
}

export async function actualizarMiContacto(input: {
  telefono?: string;
  email: string;
}) {
  const usuarioId = await requireUsuarioId();
  await prisma.contacto.update({
    where: { usuarioId },
    data: { telefono: input.telefono, email: input.email },
  });
}
