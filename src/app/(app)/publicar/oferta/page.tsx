import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { OfertaForm } from "@/components/oferta/OfertaForm";

export default async function PublicarOfertaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/publicar/oferta");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Publicar"
        title="Publicar una oferta"
        subtitle="Crea una página propia para tu promoción y compártela en Instagram, WhatsApp o Google. No aparece en el catálogo: es un enlace tuyo para captar clientes."
      />
      <div className="rounded-xl border border-border bg-card p-6">
        <OfertaForm />
      </div>
    </div>
  );
}
