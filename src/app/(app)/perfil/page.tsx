import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { getMiContacto } from "@/lib/actions/contacto";
import { getMisAlertas } from "@/lib/actions/alertas";
import {
  getMiSuscripcion,
  confirmarSuscripcion,
} from "@/lib/actions/suscripcion";
import { PLANES_PRO, MONEDA_PLAN } from "@/lib/traspaso/planes";
import { formatearImporte } from "@/lib/talento/precios";
import { PageHeader } from "@/components/layout/PageHeader";
import { getEstadoCobros } from "@/lib/actions/connect";
import { getMiAccesoTalento } from "@/lib/actions/talentoPagos";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { MisAlertas } from "@/components/alertas/MisAlertas";
import { GestionarSuscripcionButton } from "@/components/suscripcion/GestionarSuscripcionButton";
import { ActivarCobrosCard } from "@/components/perfil/ActivarCobrosCard";

export default async function PerfilPage(props: PageProps<"/perfil">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil");

  // Confirm a subscription checkout returning from Stripe.
  const sp = await props.searchParams;
  if (typeof sp.session_id === "string") {
    await confirmarSuscripcion(sp.session_id);
  }

  const [usuario, contacto, alertas, suscripcion, estadoCobros, accesoTalento] =
    await Promise.all([
      prisma.usuario.findUnique({
        where: { id: user.id },
        select: { nombre: true },
      }),
      getMiContacto(),
      getMisAlertas(),
      getMiSuscripcion(),
      getEstadoCobros(),
      getMiAccesoTalento(),
    ]);
  const planActivo =
    suscripcion?.estado === "activa" ? PLANES_PRO[suscripcion.plan] : null;

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

      <ActivarCobrosCard
        tieneCuenta={estadoCobros?.tieneCuenta ?? false}
        cobrosActivos={estadoCobros?.cobrosActivos ?? false}
        datosPendientes={estadoCobros?.datosPendientes ?? false}
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">
          Suscripción profesional
        </h2>
        {planActivo ? (
          <div className="mt-3 space-y-4">
            <div>
              <p className="text-sm text-foreground">
                Plan{" "}
                <span className="font-semibold">{planActivo.nombre}</span> ·{" "}
                {formatearImporte(planActivo.importe, MONEDA_PLAN)} / mes
              </p>
              <p className="text-sm text-muted-foreground">
                {planActivo.limite
                  ? `Hasta ${planActivo.limite} anuncios activos.`
                  : "Anuncios ilimitados."}
                {suscripcion?.vigenteHasta &&
                  ` Renueva el ${new Date(suscripcion.vigenteHasta).toLocaleDateString("es-ES")}.`}
              </p>
            </div>
            <GestionarSuscripcionButton />
          </div>
        ) : (
          <div className="mt-1 space-y-3">
            <p className="text-sm text-muted-foreground">
              Publica varios traspasos a la vez con un plan profesional.
            </p>
            <Link
              href="/planes-profesionales"
              className="inline-flex text-sm font-semibold text-gold underline-offset-4 hover:underline"
            >
              Ver planes profesionales →
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">
          Acceso a Empleo &amp; Talento
        </h2>
        {accesoTalento.ilimitadoHasta ? (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Acceso ilimitado a CVs</span> ·
              válido hasta{" "}
              {new Date(accesoTalento.ilimitadoHasta).toLocaleDateString("es-ES")}
            </p>
            <p className="text-sm text-muted-foreground">
              {accesoTalento.usados}{" "}
              {accesoTalento.usados === 1
                ? "CV desbloqueado"
                : "CVs desbloqueados"}{" "}
              hasta ahora.
            </p>
          </div>
        ) : accesoTalento.saldo > 0 ? (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-foreground">
              Te quedan{" "}
              <span className="font-semibold">
                {accesoTalento.saldo} desbloqueos
              </span>{" "}
              disponibles.
            </p>
            <p className="text-sm text-muted-foreground">
              {accesoTalento.usados} usados hasta ahora.
            </p>
          </div>
        ) : (
          <div className="mt-1 space-y-3">
            <p className="text-sm text-muted-foreground">
              No tienes ningún pack de acceso activo. Contrata uno para
              desbloquear los CVs de los candidatos.
            </p>
            <Link
              href="/talento"
              className="inline-flex text-sm font-semibold text-gold underline-offset-4 hover:underline"
            >
              Ver candidatos y packs →
            </Link>
          </div>
        )}
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
