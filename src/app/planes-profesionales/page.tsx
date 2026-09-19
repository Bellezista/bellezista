import { Check } from "lucide-react";
import { PLANES_PRO, ORDEN_PLANES, MONEDA_PLAN } from "@/lib/traspaso/planes";
import { getMiSuscripcion } from "@/lib/actions/suscripcion";
import { formatearImporte } from "@/lib/talento/precios";
import { createClient } from "@/lib/supabase/server";
import { SuscribirseButton } from "@/components/suscripcion/SuscribirseButton";
import { GestionarSuscripcionButton } from "@/components/suscripcion/GestionarSuscripcionButton";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Planes para profesionales · Bellezista" };

export default async function PlanesProfesionalesPage(
  props: PageProps<"/planes-profesionales">,
) {
  const sp = await props.searchParams;
  const suscripcion = await getMiSuscripcion();
  const planActivo = suscripcion?.estado === "activa" ? suscripcion.plan : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#efe9df]">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
              Traspasos · Profesionales e inmobiliarias
            </span>
            <h1 className="mt-3 font-serif text-[2.2rem] leading-tight text-foreground md:text-4xl">
              Planes para profesionales
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Publica varios traspasos a la vez con una suscripción mensual. Elige
              el plan según el número de anuncios activos que necesites.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 py-16">
          {sp.suscripcion === "cancel" && (
            <p className="mb-8 rounded-lg border border-border bg-[#f6f2ea] px-4 py-3 text-sm text-muted-foreground">
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
                  className={`flex flex-col rounded-2xl bg-[#f6f2ea] p-6 ${
                    destacado ? "border-2 border-gold" : "border border-border"
                  }`}
                >
                  {destacado && (
                    <span className="mb-3 w-fit rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                      Más popular
                    </span>
                  )}
                  <h2 className="font-serif text-2xl text-foreground">{p.nombre}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{p.descripcion}</p>
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
      </main>
      <Footer />
    </div>
  );
}
