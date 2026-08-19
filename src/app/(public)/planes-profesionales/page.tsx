import { Check } from "lucide-react";
import { PLANES_PRO, ORDEN_PLANES, MONEDA_PLAN } from "@/lib/traspaso/planes";
import { getMiSuscripcion } from "@/lib/actions/suscripcion";
import { formatearImporte } from "@/lib/talento/precios";
import { SuscribirseButton } from "@/components/suscripcion/SuscribirseButton";
import { GestionarSuscripcionButton } from "@/components/suscripcion/GestionarSuscripcionButton";

export const dynamic = "force-dynamic";

export default async function PlanesProfesionalesPage(
  props: PageProps<"/planes-profesionales">,
) {
  const sp = await props.searchParams;
  const suscripcion = await getMiSuscripcion();
  const planActivo =
    suscripcion?.estado === "activa" ? suscripcion.plan : null;

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-cream px-6 py-9 md:px-10 md:py-11">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          Traspasos · Profesionales e inmobiliarias
        </span>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground md:text-4xl">
          Planes para profesionales
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Publica varios traspasos a la vez con una suscripción mensual. Elige el
          plan según el número de anuncios activos que necesites.
        </p>
      </div>

      {sp.suscripcion === "cancel" && (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Has cancelado el proceso. Puedes suscribirte cuando quieras.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {ORDEN_PLANES.map((plan) => {
          const p = PLANES_PRO[plan];
          const destacado = plan === "PROFESIONAL";
          const esActual = planActivo === plan;
          return (
            <div
              key={plan}
              className={`flex flex-col rounded-2xl border bg-card p-6 ${
                destacado ? "border-2 border-gold" : "border-border"
              }`}
            >
              {destacado && (
                <span className="mb-3 w-fit rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                  Más popular
                </span>
              )}
              <h2 className="font-serif text-2xl text-foreground">{p.nombre}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.descripcion}
              </p>
              <p className="mt-4 font-serif text-3xl text-foreground">
                {formatearImporte(p.importe, MONEDA_PLAN)}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / mes
                </span>
              </p>

              <ul className="mt-5 flex-1 space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 text-gold" aria-hidden="true" />
                  {p.limite ? `${p.limite} anuncios activos` : "Anuncios ilimitados"}
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 text-gold" aria-hidden="true" />
                  Perfil profesional
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 text-gold" aria-hidden="true" />
                  Renovación mensual, cancela cuando quieras
                </li>
              </ul>

              <div className="mt-6">
                {esActual ? (
                  <div className="space-y-2">
                    <p className="text-center text-sm font-medium text-gold">
                      Tu plan actual
                    </p>
                    <GestionarSuscripcionButton />
                  </div>
                ) : (
                  <SuscribirseButton
                    plan={plan}
                    destacado={destacado}
                    label={planActivo ? "Cambiar a este plan" : "Suscribirme"}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
