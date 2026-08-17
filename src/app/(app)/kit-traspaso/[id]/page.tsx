import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { confirmarKit } from "@/lib/traspaso/kit-otorgar";
import { PageHeader } from "@/components/layout/PageHeader";
import { DatosKitForm } from "@/components/traspaso/DatosKitForm";

export default async function KitDatosPage(
  props: PageProps<"/kit-traspaso/[id]">,
) {
  const { id } = await props.params;
  const sp = await props.searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Confirm payment straight from the success redirect.
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;
  if (sessionId) await confirmarKit(sessionId, user.id);

  const kit = await prisma.kitTraspaso.findUnique({
    where: { id },
    select: { usuarioId: true, estado: true },
  });
  if (!kit || kit.usuarioId !== user.id) notFound();

  if (kit.estado === "pendiente_pago") {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader eyebrow="Kit Traspaso" title="Procesando tu pago" />
        <p className="mt-4 text-sm text-muted-foreground">
          Estamos confirmando tu pago. Si no se actualiza en unos segundos,
          recarga la página.
        </p>
      </div>
    );
  }

  if (kit.estado === "datos_enviados") {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Kit Traspaso"
          title="¡Datos recibidos!"
          subtitle="Estamos preparando tu documentación."
        />
        <p className="mt-4 rounded-lg border border-border bg-card p-6 text-sm leading-relaxed text-foreground">
          Hemos recibido los datos de tu operación. Recibirás el documento de
          reserva, el contrato de traspaso y el pack de imágenes y textos por
          email en un plazo máximo de 24 horas laborables.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Kit Traspaso"
        title="Datos para tus documentos"
        subtitle="Rellena la información de tu operación. Con esto preparamos el documento de reserva y el contrato de traspaso."
      />
      <DatosKitForm kitId={id} />
    </div>
  );
}
