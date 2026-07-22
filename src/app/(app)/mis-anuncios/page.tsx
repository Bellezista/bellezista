import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getMisAnuncios } from "@/lib/actions/anuncios";
import { PanelStatsRow } from "@/components/panel/PanelStatsRow";
import { MisAnunciosTable } from "@/components/panel/MisAnunciosTable";

export const dynamic = "force-dynamic";

export default async function MisAnunciosPage() {
  // getMisAnuncios already returns serialized (Decimal-free) data -- see
  // src/lib/actions/anuncios.ts for why that lives in the action itself.
  const anuncios = await getMisAnuncios();

  // AppLayout already fetches nombre for the topbar, but doesn't pass it
  // down to pages -- re-fetching here is the same one-line query, not worth
  // threading through a layout->page prop just to avoid it.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const usuario = user
    ? await prisma.usuario.findUnique({
        where: { id: user.id },
        select: { nombre: true },
      })
    : null;
  const nombre = usuario?.nombre ?? user?.email ?? "Miembro";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Hola, {nombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          Vistas, mensajes y estado de tus publicaciones
        </p>
      </div>
      <PanelStatsRow anuncios={anuncios} />
      <MisAnunciosTable anuncios={anuncios} />
    </div>
  );
}
