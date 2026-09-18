import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  Lock,
  Newspaper,
  Store,
  UserRound,
  Users,
} from "lucide-react";

import { getAnunciosMaquinaria, getAnunciosTraspaso } from "@/lib/actions/anuncios";
import { getCvs } from "@/lib/actions/talento";
import { getProximosEventos } from "@/lib/actions/eventos";
import { createClient } from "@/lib/supabase/server";
import { PUESTO_TALENTO_LABEL } from "@/lib/anuncio/labels";
import { Footer } from "@/components/layout/Footer";
import { PortadaNav } from "@/components/home/PortadaNav";
import { HeroCarrusel } from "@/components/home/HeroCarrusel";
import { NewsletterBox } from "@/components/home/NewsletterBox";
import { UltimosAnuncios } from "@/components/home/UltimosAnuncios";

export const dynamic = "force-dynamic";

const BUCKET =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site";

const EXPLORA = [
  { href: "/traspasos", label: "Traspasos", Icon: Store },
  { href: "/catalogo", label: "Maquinaria", Icon: LayoutGrid },
  { href: "/talento", label: "Empleo & Talento", Icon: Users },
  { href: "/profesionales", label: "Profesionales", Icon: UserRound },
  { href: "/actualidad", label: "Actualidad", Icon: Newspaper },
];

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export default async function LandingPage() {
  const [maquinaria, traspaso, cvs, eventos] = await Promise.all([
    getAnunciosMaquinaria(),
    getAnunciosTraspaso(),
    getCvs(),
    getProximosEventos(3),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // "Hoy en Bellezista" -- real featured items, only the ones that have data.
  const cv = cvs[0];
  const hoy = [
    traspaso[0] && {
      tag: "Negocio destacado",
      titulo: traspaso[0].titulo,
      img: traspaso[0].fotos[0] ?? `${BUCKET}/hero-salon.jpg`,
      href: `/anuncios/${traspaso[0].id}`,
      cta: "Ver anuncio",
    },
    cv && {
      tag: "Profesional destacado",
      titulo: PUESTO_TALENTO_LABEL[cv.puesto],
      desc: `${cv.aniosExperiencia} años de experiencia · ${cv.provincia}`,
      lock: true,
      href: `/talento/${cv.id}`,
      cta: "Conócelo",
    },
    maquinaria[0] && {
      tag: "Maquinaria destacada",
      titulo: maquinaria[0].titulo,
      img: maquinaria[0].fotos[0] ?? `${BUCKET}/hero-maquinaria-equipo3.jpg`,
      href: `/anuncios/${maquinaria[0].id}`,
      cta: "Ver equipo",
    },
    (traspaso[1] || maquinaria[1]) && {
      tag: "Novedad",
      titulo: (traspaso[1] || maquinaria[1])!.titulo,
      img:
        (traspaso[1] || maquinaria[1])!.fotos[0] ?? `${BUCKET}/hero-talento.jpg`,
      href: `/anuncios/${(traspaso[1] || maquinaria[1])!.id}`,
      cta: "Ver más",
    },
  ].filter(Boolean) as {
    tag: string;
    titulo: string;
    desc?: string;
    img?: string;
    lock?: boolean;
    href: string;
    cta: string;
  }[];

  // "Últimos anuncios" -- newest real listings across sections (carousel).
  const ultimos = [...traspaso, ...maquinaria]
    .sort(
      (a, b) =>
        new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
    )
    .slice(0, 8);

  return (
    <div className="bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />
      <HeroCarrusel />

      {/* HOY EN BELLEZISTA */}
      {hoy.length > 0 && (
        <section className="px-6 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
                Hoy en Bellezista
              </span>
              <div className="mx-auto mt-4 h-0.5 w-14 bg-gold" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {hoy.map((c) => (
                <Link
                  key={c.tag + c.titulo}
                  href={c.href}
                  className="group grid min-h-[13.5rem] grid-cols-[0.92fr_1.08fr] overflow-hidden rounded-xl border border-border bg-[#f6f2ea] shadow-[0_1px_2px_rgba(20,19,16,.04),0_12px_28px_rgba(20,19,16,.09)] transition-shadow hover:shadow-[0_16px_38px_rgba(20,19,16,.15)]"
                >
                  {/* Text on the left, over a soft milk background */}
                  <div className="flex flex-col gap-2 p-6">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold">
                      {c.tag}
                    </span>
                    <h3 className="font-serif text-[1.2rem] leading-snug text-foreground">
                      {c.titulo}
                    </h3>
                    {c.desc && (
                      <p className="text-[0.76rem] leading-relaxed text-muted-foreground">
                        {c.desc}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-foreground">
                      {c.cta}
                      <ArrowRight className="size-3.5 text-gold" aria-hidden="true" />
                    </span>
                  </div>

                  {/* Image on the right; left edge feathers into the milk area */}
                  <div className="relative overflow-hidden">
                    {c.lock ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#3a352b] to-[#171512] px-3 text-center">
                        <Lock className="size-7 text-gold" aria-hidden="true" />
                        <span className="text-[0.6rem] uppercase tracking-[0.14em] text-white/70">
                          Perfil protegido
                        </span>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={c.img!}
                          alt=""
                          fill
                          sizes="(min-width:640px) 24vw, 60vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#f6f2ea] to-transparent" />
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXPLORA BELLEZISTA */}
      <section className="bg-cream px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
              Explora Bellezista
            </span>
            <div className="mx-auto mt-4 h-0.5 w-14 bg-gold" />
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {EXPLORA.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center gap-3.5 text-center text-foreground transition-colors hover:text-gold"
              >
                <Icon className="size-8 text-gold" strokeWidth={1.4} aria-hidden="true" />
                <span className="text-sm font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACTUALIDAD + PROXIMOS EVENTOS */}
      <section className="w-full pb-20">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2">
          {/* Actualidad -- dark editorial card */}
          <Link
            href="/actualidad"
            className="group relative flex min-h-[440px] overflow-hidden bg-[#171512] text-white"
          >
            <div className="relative z-10 flex max-w-[50%] flex-col justify-center gap-4 p-8 md:p-10">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold">
                Actualidad
              </span>
              <h3 className="font-serif text-[1.6rem] leading-tight md:text-[1.8rem]">
                Tendencias que marcan el futuro de la belleza
              </h3>
              <p className="text-[0.82rem] leading-relaxed text-white/70">
                Las últimas novedades, tecnologías y estrategias para mantener tu
                negocio a la vanguardia.
              </p>
              <span className="mt-2 inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white">
                Leer artículo
                <ArrowRight className="size-4 text-gold" aria-hidden="true" />
              </span>
            </div>
            <div className="absolute inset-y-0 right-0 w-[56%]">
              <Image
                src={`${BUCKET}/hero-rostro.jpg`}
                alt="Tendencias del sector de la belleza"
                fill
                sizes="(min-width:1024px) 28vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#171512] via-[#171512]/45 to-transparent" />
            </div>
          </Link>

          {/* Próximos eventos */}
          <div className="flex flex-col pr-6 pt-12 md:pr-10 lg:pr-16">
            <div className="mb-8">
              <span className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
                Próximos eventos
              </span>
              <div className="mt-4 h-0.5 w-14 bg-gold" />
            </div>
            {eventos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay eventos programados. Los publicaremos aquí en cuanto
                haya novedades del sector.
              </p>
            ) : (
              <div className="grid flex-1 grid-cols-1 border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
                {eventos.map((ev) => {
                  const f = new Date(ev.fecha);
                  return (
                    <div
                      key={ev.id}
                      className="flex flex-col border-t border-border pt-5 first:border-t-0 sm:border-t-0 sm:px-5 sm:first:pl-0 sm:last:pr-0"
                    >
                      <span className="font-serif text-[2rem] leading-none text-foreground">
                        {String(f.getDate()).padStart(2, "0")}
                      </span>
                      <span className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {MESES[f.getMonth()]}
                      </span>
                      <h4 className="mt-5 text-[0.95rem] font-semibold leading-snug text-foreground">
                        {ev.titulo}
                      </h4>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {[ev.ciudad, ev.modalidad].filter(Boolean).join(" · ")}
                      </p>
                      <Link
                        href={ev.url ?? "/actualidad"}
                        className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-foreground transition-colors hover:text-gold"
                      >
                        Ver evento
                        <ArrowRight className="size-3.5 text-gold" aria-hidden="true" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ULTIMOS ANUNCIOS + NEWSLETTER */}
      <section className="w-full pb-24">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-[1.9fr_1fr]">
          {ultimos.length > 0 ? (
            <UltimosAnuncios items={ultimos} />
          ) : (
            <div />
          )}
          <NewsletterBox vertical />
        </div>
      </section>

      <Footer />
    </div>
  );
}
