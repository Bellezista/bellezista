import Image from "next/image";
import {
  CalendarClock,
  LayoutGrid,
  Sparkles,
  Users,
  HeartHandshake,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  getResumenDiarioFeed,
  getResumenPeriodo,
  type LineaResumen,
} from "@/lib/home/resumen";
import { getProximosEventos } from "@/lib/actions/eventos";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";
import { NewsletterBox } from "@/components/home/NewsletterBox";

export const dynamic = "force-dynamic";
export const metadata = { title: "Actualidad · Bellezista" };

const BUCKET =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site";

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

const SELLOS = [
  { Icon: CalendarClock, titulo: "Actualizado cada día", texto: "Se genera solo, a diario." },
  { Icon: LayoutGrid, titulo: "Todo el sector, en un solo lugar", texto: "Traspasos, talento, maquinaria y más." },
  { Icon: Sparkles, titulo: "Directo de la plataforma, sin relleno", texto: "Solo actividad real de Bellezista." },
];

const COMUNIDAD = [
  { Icon: Users, texto: "Miles de profesionales confían en Bellezista cada día." },
  { Icon: Sparkles, texto: "Nuevas oportunidades cada día en toda España." },
  { Icon: HeartHandshake, texto: "Acompañamiento y asesoramiento personalizado." },
];

function Lineas({ lineas }: { lineas: LineaResumen[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {lineas.map((l, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[0.9rem] leading-snug text-foreground/85">
          <span className="mt-[0.4rem] size-1.5 shrink-0 rounded-full bg-gold" />
          <span>
            <b className="font-semibold text-foreground">{l.destacado}</b>
            {l.texto}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function ActualidadPage() {
  const [feed, periodo, eventos] = await Promise.all([
    getResumenDiarioFeed(10),
    getResumenPeriodo(30),
    getProximosEventos(6),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />

      {/* HERO */}
      <section className="relative flex min-h-[440px] items-center overflow-hidden bg-[#efe9df] md:min-h-[520px]">
        <img
          src={`${BUCKET}/hero-actualidad.jpg`}
          alt="Actualidad del sector de la belleza"
          className="absolute inset-0 h-full w-full object-cover object-[70%_top]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#efe9df] via-[#efe9df]/85 to-transparent md:from-[#efe9df] md:via-[#efe9df]/80 md:via-40% md:to-transparent md:to-72%" />

        <div className="relative w-full px-6 py-12 md:px-14 md:py-16 lg:px-20">
          <div className="max-w-[44rem]">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
              Actualidad Bellezista
            </span>
            <h1 className="mt-3 font-serif text-[2.2rem] leading-[1.1] text-foreground md:text-[3rem]">
              Todo lo que pasa cada día
              <br className="hidden md:inline" /> en el sector de la belleza
            </h1>

            <div className="mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
              {SELLOS.map(({ Icon, titulo, texto }) => (
                <div key={titulo} className="flex flex-col gap-1.5">
                  <Icon className="size-6 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-[0.8rem] font-bold uppercase tracking-[0.06em] text-foreground">
                    {titulo}
                  </span>
                  <span className="text-[0.75rem] leading-snug text-muted-foreground">
                    {texto}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOS FEEDS */}
      <div className="w-full px-6 py-14 md:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Feed diario */}
          <section>
            <div className="mb-8">
              <span className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
                Resumen diario
              </span>
              <div className="mt-4 h-0.5 w-14 bg-gold" />
            </div>

            {feed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay actividad reciente. Las novedades del sector aparecerán
                aquí cada día.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {feed.map((dia) => {
                  const f = new Date(`${dia.fecha}T12:00:00`);
                  return (
                    <article
                      key={dia.fecha}
                      className="grid grid-cols-[64px_1fr] gap-5 rounded-xl border border-border bg-[#f6f2ea] p-5"
                    >
                      <div className="text-center">
                        <span className="block font-serif text-2xl leading-none text-foreground">
                          {String(f.getDate()).padStart(2, "0")}
                        </span>
                        <span className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                          {MESES[f.getMonth()]}
                        </span>
                      </div>
                      <div className="border-l border-border pl-5">
                        <Lineas lineas={dia.lineas} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Feed de periodo (mes) */}
          <section>
            <div className="mb-8">
              <span className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
                Resumen del mes
              </span>
              <div className="mt-4 h-0.5 w-14 bg-gold" />
            </div>

            <div className="rounded-xl bg-[#171512] p-8 text-white">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">
                Últimos 30 días
              </span>
              <h3 className="mt-2 font-serif text-2xl">Así ha ido el mes</h3>
              <div className="mt-6">
                {periodo.length === 0 ? (
                  <p className="text-sm text-white/60">
                    La actividad del mes se irá resumiendo aquí.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3.5">
                    {periodo.map((l, i) => (
                      <li key={i} className="flex items-start gap-3.5 text-[0.95rem] leading-snug text-white/90">
                        <span className="mt-2 size-2 shrink-0 rounded-full bg-gold" />
                        <span>
                          <b className="font-semibold text-white">{l.destacado}</b>
                          {l.texto}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* PRÓXIMOS EVENTOS */}
      <section className="px-6 pb-16 md:px-10 lg:px-16">
        <div className="mb-8">
          <span className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
            Próximos eventos
          </span>
          <div className="mt-4 h-0.5 w-14 bg-gold" />
        </div>
        {eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay eventos programados. Los publicaremos aquí en cuanto haya
            novedades del sector.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-border">
            {eventos.map((ev, i) => {
              const f = new Date(ev.fecha);
              return (
                <div
                  key={ev.id}
                  className={`flex flex-col ${i % 3 !== 0 ? "lg:pl-8" : ""} ${i % 3 !== 2 ? "lg:pr-8" : ""}`}
                >
                  <span className="font-serif text-[2rem] leading-none text-foreground">
                    {String(f.getDate()).padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {MESES[f.getMonth()]}
                  </span>
                  <h4 className="mt-4 text-[0.95rem] font-semibold leading-snug text-foreground">
                    {ev.titulo}
                  </h4>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {[ev.ciudad, ev.modalidad].filter(Boolean).join(" · ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* COMUNIDAD + NEWSLETTER */}
      <section className="w-full bg-[#171512] text-white">
        <div className="grid items-stretch lg:grid-cols-[0.85fr_1.25fr_1fr]">
          <div className="relative hidden min-h-[300px] lg:block">
            <Image
              src={`${BUCKET}/comunidad.jpg`}
              alt=""
              fill
              sizes="25vw"
              className="object-cover object-[70%_center]"
            />
          </div>
          <NewsletterBox vertical />
          <div className="flex flex-col justify-center gap-6 p-10 md:p-12">
            {COMUNIDAD.map(({ Icon, texto }) => (
              <div key={texto} className="flex items-start gap-3.5">
                <Icon className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-white/80">{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
