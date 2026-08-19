import "server-only";
import { prisma } from "@/lib/prisma/client";

// Creates an in-app notification for a user. Called from the server actions that
// handle the triggering events (new message, new contact, CV unlocked).
export async function crearNotificacion(
  usuarioId: string,
  n: { tipo: string; titulo: string; cuerpo?: string; url?: string },
): Promise<void> {
  await prisma.notificacion.create({
    data: {
      usuarioId,
      tipo: n.tipo,
      titulo: n.titulo,
      cuerpo: n.cuerpo,
      url: n.url,
    },
  });
}
