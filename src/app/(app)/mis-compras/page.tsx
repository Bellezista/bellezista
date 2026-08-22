import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMisCompras, confirmarCompra } from "@/lib/actions/operacion";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompraRow, type CompraView } from "@/components/operacion/CompraRow";

export const dynamic = "force-dynamic";

export default async function MisComprasPage(props: PageProps<"/mis-compras">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mis-compras");

  // Confirm a purchase returning from Stripe (belt-and-suspenders vs webhook).
  const sp = await props.searchParams;
  if (typeof sp.session_id === "string") {
    await confirmarCompra(sp.session_id);
  }

  const compras = await getMisCompras();
  const vista: CompraView[] = compras.map((c) => ({
    id: c.id,
    estadoOperacion: c.estadoOperacion,
    precioFinal: c.precioFinal ? c.precioFinal.toString() : null,
    fechaPago: c.fechaPago ? c.fechaPago.toISOString() : null,
    plazoRevision: c.plazoRevision,
    anuncio: c.anuncio
      ? { id: c.anuncio.id, titulo: c.anuncio.titulo, fotos: c.anuncio.fotos }
      : null,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Mi cuenta"
        title="Mis compras"
        subtitle="Tus compras con pago seguro. Confirma la recepción para liberar el pago al vendedor."
      />

      {sp.compra === "ok" && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm text-foreground">
          Pago realizado. El dinero queda retenido de forma segura hasta que
          confirmes que todo está correcto.
        </div>
      )}

      {vista.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no has hecho ninguna compra.
          </p>
          <Link
            href="/catalogo"
            className="mt-2 inline-flex text-sm font-semibold text-gold underline-offset-4 hover:underline"
          >
            Ver catálogo →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vista.map((c) => (
            <CompraRow key={c.id} compra={c} />
          ))}
        </div>
      )}
    </div>
  );
}
