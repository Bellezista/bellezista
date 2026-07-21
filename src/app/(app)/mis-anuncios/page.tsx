import { getMisAnuncios } from "@/lib/actions/anuncios";
import { PanelStatsRow } from "@/components/panel/PanelStatsRow";
import { MisAnunciosTable } from "@/components/panel/MisAnunciosTable";

export const dynamic = "force-dynamic";

export default async function MisAnunciosPage() {
  // getMisAnuncios already returns serialized (Decimal-free) data -- see
  // src/lib/actions/anuncios.ts for why that lives in the action itself.
  const anuncios = await getMisAnuncios();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Mis anuncios
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
