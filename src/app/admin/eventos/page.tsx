import { listEventosAdmin } from "@/lib/actions/eventos";
import { EventosAdmin, type EventoView } from "@/components/admin/EventosAdmin";

export const dynamic = "force-dynamic";

export default async function AdminEventosPage() {
  const eventos = await listEventosAdmin();
  const vista: EventoView[] = eventos.map((e) => ({
    id: e.id,
    titulo: e.titulo,
    ciudad: e.ciudad,
    modalidad: e.modalidad,
    fecha: e.fecha.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-foreground">Eventos del sector</h1>
      <p className="text-sm text-muted-foreground">
        Estos eventos aparecen en la portada y en Actualidad. Solo se muestran los
        que aún no han pasado de fecha.
      </p>
      <EventosAdmin eventos={vista} />
    </div>
  );
}
