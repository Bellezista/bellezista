import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { getMiContacto } from "@/lib/actions/contacto";
import { getMisAlertas } from "@/lib/actions/alertas";
import { PageHeader } from "@/components/layout/PageHeader";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { MisAlertas } from "@/components/alertas/MisAlertas";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil");

  const [usuario, contacto, alertas] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: user.id },
      select: { nombre: true },
    }),
    getMiContacto(),
    getMisAlertas(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Mi cuenta"
        title="Perfil"
        subtitle="Tus datos de cuenta y de contacto."
      />

      <div className="space-y-1 rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Nombre
        </p>
        <p className="text-lg font-semibold text-foreground">
          {usuario?.nombre ?? "Miembro"}
        </p>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
          Correo de la cuenta
        </p>
        <p className="text-sm text-foreground">{user.email}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-xl text-foreground">
          Datos de contacto
        </h2>
        <PerfilForm
          defaultEmail={contacto?.email ?? user.email ?? ""}
          defaultTelefono={contacto?.telefono ?? ""}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">
          Alertas de búsqueda
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Recibirás un resumen semanal por email con los anuncios nuevos que
          encajen con tus filtros guardados.
        </p>
        <MisAlertas
          alertas={alertas.map((a) => ({
            id: a.id,
            seccion: a.seccion,
            filtros: a.filtros,
          }))}
        />
      </div>
    </div>
  );
}
