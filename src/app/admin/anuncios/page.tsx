import { listAnunciosAdmin } from "@/lib/actions/admin";
import { serializeAnuncios } from "@/types/anuncio";
import { AdminAnunciosTable } from "@/components/admin/AdminAnunciosTable";

export const dynamic = "force-dynamic";

export default async function AdminAnunciosPage() {
  const anunciosRaw = await listAnunciosAdmin();
  // AdminAnunciosTable is a Client Component -- Prisma's Decimal (precio)
  // can't cross that boundary as a prop, see src/types/anuncio.ts.
  const anuncios = serializeAnuncios(anunciosRaw).map((a, i) => ({
    ...a,
    propietario: anunciosRaw[i].propietario,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Anuncios
      </h1>
      <AdminAnunciosTable anuncios={anuncios} />
    </div>
  );
}
