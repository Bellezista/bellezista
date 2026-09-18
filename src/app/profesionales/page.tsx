import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, MapPin, Megaphone, ArrowRight, Users, HeartHandshake } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getProveedores } from "@/lib/actions/proveedores";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";
import { NewsletterBox } from "@/components/home/NewsletterBox";
import { ProveedoresBusqueda } from "@/components/proveedores/ProveedoresBusqueda";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profesionales · Bellezista" };

const BUCKET =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site";

const SELLOS = [
  {
    Icon: ShieldCheck,
    titulo: "Contacto seguro",
    texto: "Tus datos protegidos en cada contacto.",
  },
  {
    Icon: Sparkles,
    titulo: "Profesionales especializados en belleza",
    texto: "Expertos que conocen tu sector.",
  },
  {
    Icon: MapPin,
    titulo: "Cobertura en toda España",
    texto: "Encuentra ayuda esté donde esté tu negocio.",
  },
];

const COMUNIDAD = [
  { Icon: Users, texto: "Miles de profesionales confían en Bellezista cada día." },
  { Icon: Sparkles, texto: "Nuevas oportunidades cada día en toda España." },
  { Icon: HeartHandshake, texto: "Acompañamiento y asesoramiento personalizado." },
];

export default async function ProfesionalesPage() {
  const proveedores = await getProveedores();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />

      {/* HERO */}
      <section className="relative flex min-h-[420px] items-center overflow-hidden bg-[#efe9df] md:min-h-[480px]">
        <img
          src={`${BUCKET}/asesoria-talento.jpg`}
          alt="Profesionales para negocios de belleza"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#efe9df] via-[#efe9df]/85 to-transparent md:from-[#efe9df] md:via-[#efe9df]/80 md:via-40% md:to-transparent md:to-72%" />

        <div className="relative w-full px-6 py-12 md:px-14 md:py-16 lg:px-20">
          <div className="max-w-[44rem]">
            <h1 className="font-serif text-[2.3rem] leading-[1.08] text-foreground md:text-[3.2rem]">
              Profesionales para ayudarte
              <br className="hidden md:inline" /> en tu negocio de belleza
            </h1>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              Gestorías, marketing, licencias, formación, distribuidores y más:
              todo lo que tu centro necesita, en un solo lugar.
            </p>

            <div className="mt-9 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
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

      {/* DIRECTORIO */}
      <ProveedoresBusqueda proveedores={proveedores} />

      {/* BANNERS PROPIOS */}
      <div className="w-full space-y-6 px-6 pb-16 md:px-10 lg:px-16">
        {/* Anúnciate */}
        <div className="flex flex-col gap-5 rounded-xl border border-gold/40 bg-gold/10 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="font-serif text-xl leading-tight text-foreground md:text-2xl">
              ¿Eres profesional del sector?
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground">
              Date a conocer entre miles de negocios de belleza de toda España.
              Anúnciate en el directorio de Bellezista.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-gold/90"
          >
            Anúnciate aquí
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Espacio publicitario premium (visual) */}
        <div className="flex flex-col gap-5 overflow-hidden rounded-xl bg-[#171512] p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
              <Megaphone className="size-5" aria-hidden="true" />
            </span>
            <div>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">
                Espacio publicitario premium
              </span>
              <p className="mt-1.5 font-serif text-xl leading-tight md:text-2xl">
                Tu marca, vista por todo el sector
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                Un único anunciante destacado por día, 4 días al mes. Máxima
                visibilidad por 50 €/mes.
              </p>
            </div>
          </div>
          <Link
            href="/contacto"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gold px-7 py-3.5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-foreground"
          >
            Reservar espacio
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
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

      <Footer />
    </div>
  );
}
