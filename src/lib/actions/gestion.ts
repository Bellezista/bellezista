"use server";

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

// Captures a lead when a Barcelona particular requests SoluciónOK's free
// professional management. SoluciónOK follows up by hand (10% a éxito).
export async function solicitarGestionProfesional(input: {
  titulo?: string;
  precio?: number;
  provincia?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión para solicitar la ayuda." };

  await prisma.solicitudGestion.create({
    data: {
      usuarioId: user.id,
      titulo: input.titulo?.trim() || null,
      precio:
        typeof input.precio === "number" && Number.isFinite(input.precio)
          ? input.precio
          : null,
      provincia: input.provincia ?? null,
    },
  });

  return { ok: true };
}
