import Image from "next/image";
import { ShieldCheck, HeartHandshake, Megaphone, Users, Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAnunciosTraspaso } from "@/lib/actions/anuncios";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";
import { NewsletterBox } from "@/components/home/NewsletterBox";
import { TraspasoBusqueda } from "@/components/catalogo/TraspasoBusqueda";
import { SolicitarGestorBanner } from "@/components/traspaso/SolicitarGestorBanner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Traspasos · Bellezista" };

const BUCKET =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site";

const SELLOS = [
  {
    Icon: ShieldCheck,
    titulo: "Contacto seguro",
    texto: "Mensajería interna: tus datos quedan protegidos.",
  },
  {
    Icon: HeartHandshake,
    titulo: "Asesoramiento experto",
    texto: "Te acompañamos en todo el proceso.",
  },
  {
    Icon: Megaphone,
    titulo: "Máxima visibilidad",
    texto: "Llega a miles de profesionales del sector.",
  },
];

const COMUNIDAD = [
  { Icon: Users, texto: "Miles de profesionales confían en Bellezista cada día." },
  { Icon: Sparkles, texto: "Nuevas oportunidades cada día en toda España." },
  { Icon: HeartHandshake, texto: "Acompañamiento y asesoramiento personalizado." },
];

export default async function TraspasosPage() {
  const anuncios = await getAnunciosTraspaso();

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
          src={`${BUCKET}/hero-traspasos.jpg`}
          alt="Centro de belleza en traspaso"
          className="absolute inset-0 h-full w-full object-cover object-[80%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#efe9df] via-[#efe9df]/85 to-transparent md:from-[#efe9df] md:via-[#efe9df]/80 md:via-40% md:to-transparent md:to-72%" />

        <div className="relative w-full px-6 py-12 md:px-14 md:py-16 lg:px-20">
          <div className="max-w-[42rem]">
            <h1 className="font-serif text-[2.3rem] leading-[1.08] text-foreground md:text-[3.2rem]">
              Traspasos de centros
              <br className="hidden md:inline" /> de belleza
            </h1>
            <p className="mt-5 max-w-[34ch] text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              Encuentra tu próximo negocio o traspasa tu centro con total
              confianza y la máxima visibilidad.
            </p>

            <div className="mt-9 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
              {SELLOS.map(({ Icon, titulo, texto }) => (
                <div key={titulo} className="flex flex-col gap-1.5">
                  <Icon
                    className="size-6 text-gold"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
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

      {/* ASESORÍA PROFESIONAL (Barcelona) -- cerca de arriba */}
      <div className="mx-auto max-w-7xl px-6 pt-10 md:px-10">
        <SolicitarGestorBanner
          loggedIn={Boolean(user)}
          headline="¿Tu negocio está en Barcelona?"
          descripcion="Cuenta con gestión profesional gratuita para tu traspaso: nos encargamos de todo, sin coste inicial."
        />
      </div>

      {/* BÚSQUEDA + RESULTADOS */}
      <TraspasoBusqueda anuncios={anuncios} />

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
