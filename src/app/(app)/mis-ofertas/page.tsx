import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMisOfertas, confirmarOferta } from "@/lib/actions/oferta";
import { PageHeader } from "@/components/layout/PageHeader";
import { MisOfertasList, type OfertaView } from "@/components/oferta/MisOfertasList";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MisOfertasPage(props: PageProps<"/mis-ofertas">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mis-ofertas");

  // Confirm an offer returning from Stripe (belt-and-suspenders vs webhook).
  const sp = await props.searchParams;
  if (typeof sp.session_id === "string") {
    await confirmarOferta(sp.session_id);
  }

  const ofertas = await getMisOfertas();
  const vista: OfertaView[] = ofertas.map((o) => ({
    id: o.id,
    slug: o.slug,
    titulo: o.titulo,
    estado: o.estado,
    precio: o.precio.toString(),
    foto: o.foto,
    fechaCaducidad: o.fechaCaducidad ? o.fechaCaducidad.toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Mi cuenta"
        title="Mis ofertas"
        subtitle="Tus páginas de oferta para compartir. Copia el enlace y publícalo en Instagram, WhatsApp o Google."
      />

      {sp.oferta === "ok" && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm text-foreground">
          ¡Oferta publicada! Copia su enlace abajo y compártelo donde quieras.
        </div>
      )}

      <div className="flex justify-end">
        <Button
          asChild
          className="gap-1.5 rounded-full bg-gold font-semibold text-foreground hover:bg-gold/90"
        >
          <Link href="/publicar/oferta">Publicar nueva oferta</Link>
        </Button>
      </div>

      {vista.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no has publicado ninguna oferta.
          </p>
          <Link
            href="/publicar/oferta"
            className="mt-2 inline-flex text-sm font-semibold text-gold underline-offset-4 hover:underline"
          >
            Crear mi primera oferta →
          </Link>
        </div>
      ) : (
        <MisOfertasList ofertas={vista} />
      )}
    </div>
  );
}
