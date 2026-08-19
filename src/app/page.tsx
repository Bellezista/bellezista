import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { getAnunciosMaquinaria, getAnunciosTraspaso } from "@/lib/actions/anuncios";
import { getCvs } from "@/lib/actions/talento";
import { createClient } from "@/lib/supabase/server";
import { AnuncioCard } from "@/components/anuncio/AnuncioCard";
import { CvCard } from "@/components/talento/CvCard";
import { HeroTabs } from "@/components/landing/HeroTabs";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const HERO_IMG =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site/hero.png";

// Signature editorial pillars -- numbered (01/02/03) as the recurring "personality"
// motif across the luxury design pass.
const PILARES = [
  {
    n: "01",
    titulo: "Contacto seguro",
    texto:
      "El teléfono y el correo nunca se exponen. Todo el contacto ocurre dentro de la plataforma.",
  },
  {
    n: "02",
    titulo: "Solo profesionales",
    texto:
      "Un espacio dedicado al sector de la estética y la belleza, sin ruido ni intermediarios.",
  },
  {
    n: "03",
    titulo: "Todo en un lugar",
    texto:
      "Compra y vende maquinaria, traspasa negocios y encuentra talento hoy. Muy pronto, ofertas.",
  },
];

export default async function LandingPage() {
  // One featured listing per live module, so the home shows the breadth of the
  // platform. Talento/Ofertas join this list automatically once they ship.
  const [maquinaria, traspaso, cvs] = await Promise.all([
    getAnunciosMaquinaria(),
    getAnunciosTraspaso(),
    getCvs(),
  ]);

  // The landing nav is public, so check auth to swap "Iniciar sesión" for a
  // link to the account when the visitor is already logged in.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // One framed pick per live section, in menu order (Traspasos, Maquinaria,
  // Talento). Each section only shows if it has something to feature.
  type Seccion = { titulo: string; node: ReactNode };
  const seccionesRaw: (Seccion | undefined)[] = [
    traspaso[0] && {
      titulo: "Traspaso de negocios",
      node: <AnuncioCard anuncio={traspaso[0]} priority />,
    },
    maquinaria[0] && {
      titulo: "Venta de maquinaria",
      node: <AnuncioCard anuncio={maquinaria[0]} priority />,
    },
    cvs[0] && {
      titulo: "Búsqueda de talento",
      node: <CvCard cv={cvs[0]} />,
    },
  ].map((s) => s || undefined);
  const secciones = seccionesRaw.filter((s): s is Seccion => Boolean(s));

  return (
    <>
      {/* Publish notice bar -- a visible call-to-action to place an ad. On-brand
          (cream band, gold only as the accent button, never as background). */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-border bg-cream px-4 py-3.5 text-center">
        <span className="text-sm font-medium text-foreground sm:text-base">
          ¿Tienes maquinaria, un traspaso o buscas empleo? Publícalo gratis en
          Bellezista.
        </span>
        <Button
          asChild
          size="sm"
          className="rounded-full bg-gold px-6 font-semibold text-foreground hover:bg-gold/90"
        >
          <Link href="/publicar">Publicar un anuncio</Link>
        </Button>
      </div>

      {/* Hero */}
      <section className="relative isolate flex min-h-[88vh] flex-col">
        <Image
          src={HERO_IMG}
          alt="Recepción de un centro de estética profesional"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        {/* Warm, gold-toned overlay (client reference: SoluciónOK). Warm brown
            instead of neutral black so the hero reads luxurious, not cold. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#241a12]/92 via-[#241a12]/72 to-[#241a12]/30" />

        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-6 md:px-12">
          <Link href="/" className="text-background">
            <Logo className="text-2xl text-background" />
          </Link>
          <nav className="flex items-center gap-5 text-sm text-background/85 md:gap-6">
            <Link href="/traspasos" className="hidden transition-colors hover:text-gold sm:inline">
              Traspasos
            </Link>
            <Link href="/catalogo" className="hidden transition-colors hover:text-gold sm:inline">
              Maquinaria
            </Link>
            <Link href="/talento" className="hidden transition-colors hover:text-gold sm:inline">
              Empleo &amp; Talento
            </Link>
            <Link href="/publicar" className="hidden transition-colors hover:text-gold sm:inline">
              Publicar
            </Link>
            {user ? (
              <Link
                href="/mis-anuncios"
                className="border-b border-gold/60 pb-0.5 transition-colors hover:text-gold"
              >
                Mi cuenta
              </Link>
            ) : (
              <Link
                href="/login"
                className="border-b border-gold/60 pb-0.5 transition-colors hover:text-gold"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </header>

        {/* Hero content */}
        <div className="flex flex-1 items-center px-6 py-16 md:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-gold">
              Plataforma profesional del sector belleza
            </span>
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-background md:text-6xl">
              El mundo de la belleza, en un solo lugar.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-background/80 md:text-lg">
              Traspasos, maquinaria, talento y ofertas para el sector de la
              belleza. Con contacto seguro y sin exponer tus datos.
            </p>
            <HeroTabs />
          </div>
        </div>

      </section>

      {/* Pillars */}
      <section className="px-6 pb-20 pt-12 md:px-12 md:pb-28 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-gold">
            Por qué Bellezista
          </span>
          <h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Un marketplace pensado para el profesional, no para el ruido.
          </h2>

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {PILARES.map((p) => (
              <div key={p.n} className="border-t border-border pt-6">
                <span className="font-serif text-2xl text-gold">{p.n}</span>
                <h3 className="mt-3 font-serif text-xl text-foreground">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {secciones.length > 0 && (
        <section className="bg-background px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-gold">
                Destacados
              </span>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-4xl">
                Una selección de cada sección
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {secciones.map((seccion) => (
                <div
                  key={seccion.titulo}
                  className="overflow-hidden rounded-2xl border border-border bg-cream"
                >
                  <div className="border-b border-border px-5 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                      {seccion.titulo}
                    </span>
                  </div>
                  <div className="p-4">{seccion.node}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA -- dark moment, premium publish invitation */}
      <section className="bg-foreground px-6 py-20 text-background md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Publica en Bellezista
          </span>
          <div className="mt-4 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="max-w-xl font-serif text-3xl leading-tight md:text-4xl">
                Tu próximo cliente está en Bellezista
              </h2>
              <p className="mt-3 max-w-md text-background/75">
                Vende tu maquinaria, traspasa tu negocio o publica tu CV. Llega
                a todo el sector de la belleza en España.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-12 shrink-0 rounded-full bg-gold px-8 text-sm font-semibold text-foreground hover:bg-gold/90"
            >
              <Link href="/publicar">Publicar ahora</Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-8 border-t border-white/15 pt-10 sm:grid-cols-3">
            {[
              {
                titulo: "Publicar es gratis",
                texto:
                  "Empieza sin coste y destaca tu anuncio cuando quieras.",
              },
              {
                titulo: "Todo el sector, en un sitio",
                texto:
                  "Compradores y profesionales de la belleza de toda España.",
              },
              {
                titulo: "Gestión sencilla",
                texto:
                  "Controla tus anuncios, tus vistas y tus contactos desde tu panel.",
              },
            ].map((b, i) => (
              <div key={b.titulo}>
                <p className="font-serif text-2xl text-gold">
                  0{i + 1}
                </p>
                <p className="mt-2 font-medium text-background">{b.titulo}</p>
                <p className="mt-1 text-sm text-background/70">{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
