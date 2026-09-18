import Image from "next/image";
import Link from "next/link";
import { Briefcase, UserRound, Users, Sparkles, HeartHandshake } from "lucide-react";

import { getCvs } from "@/lib/actions/talento";
import { confirmarSesionCheckout } from "@/lib/talento/otorgar";
import { createClient } from "@/lib/supabase/server";
import { NewsletterBox } from "@/components/home/NewsletterBox";
import { TalentoBusqueda } from "@/components/talento/TalentoBusqueda";

export const dynamic = "force-dynamic";
export const metadata = { title: "Empleo & Talento · Bellezista" };

const BUCKET =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site";

const COMUNIDAD = [
  { Icon: Users, texto: "Miles de profesionales confían en Bellezista cada día." },
  { Icon: Sparkles, texto: "Nuevas oportunidades cada día en toda España." },
  { Icon: HeartHandshake, texto: "Acompañamiento y asesoramiento personalizado." },
];

export default async function TalentoPage(props: PageProps<"/talento">) {
  const params = await props.searchParams;

  // Confirm a Talento pack purchase returning from Stripe.
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : null;
  if (sessionId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await confirmarSesionCheckout(sessionId, user.id);
  }

  const cvs = await getCvs();

  return (
    <div className="bg-white text-foreground">
      {/* HERO */}
      <section className="relative flex min-h-[440px] items-center overflow-hidden bg-[#efe9df] md:min-h-[500px]">
        <img
          src={`${BUCKET}/hero-talento2.jpg`}
          alt="Recepción de un centro de belleza"
          className="absolute inset-0 h-full w-full object-cover object-[80%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#efe9df] via-[#efe9df]/85 to-transparent md:from-[#efe9df] md:via-[#efe9df]/80 md:via-40% md:to-transparent md:to-72%" />

        <div className="relative w-full px-6 py-12 md:px-14 md:py-16 lg:px-20">
          <div className="max-w-[44rem]">
            <h1 className="font-serif text-[2.3rem] leading-[1.08] text-foreground md:text-[3.2rem]">
              Talento que impulsa
              <br className="hidden md:inline" /> negocios de belleza
            </h1>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              Encuentra el profesional ideal para tu equipo o descubre tu próxima
              oportunidad profesional.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="size-5 text-gold" aria-hidden="true" />
                  <span className="text-[0.8rem] font-bold uppercase tracking-[0.06em] text-foreground">
                    ¿Buscas personal?
                  </span>
                </div>
                <p className="text-[0.8rem] leading-snug text-muted-foreground">
                  Publica tu oferta y encuentra al talento que necesitas.
                </p>
                <Link
                  href="#talento"
                  className="mt-1 inline-block w-fit rounded-sm border border-gold px-7 py-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:bg-gold hover:text-foreground"
                >
                  Publicar oferta
                </Link>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <UserRound className="size-5 text-gold" aria-hidden="true" />
                  <span className="text-[0.8rem] font-bold uppercase tracking-[0.06em] text-foreground">
                    ¿Buscas trabajo?
                  </span>
                </div>
                <p className="text-[0.8rem] leading-snug text-muted-foreground">
                  Crea tu perfil y accede a las mejores oportunidades del sector.
                </p>
                <Link
                  href="/talento/mi-cv"
                  className="mt-1 inline-block w-fit rounded-sm border border-gold px-7 py-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:bg-gold hover:text-foreground"
                >
                  Crear CV
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BÚSQUEDA + RESULTADOS */}
      <div id="talento" className="scroll-mt-4">
        <TalentoBusqueda cvs={cvs} />
      </div>

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
    </div>
  );
}
