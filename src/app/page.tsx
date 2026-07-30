import Image from "next/image";
import Link from "next/link";

import { getAnunciosMaquinaria } from "@/lib/actions/anuncios";
import { AnuncioCard } from "@/components/anuncio/AnuncioCard";
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
      "Compra y vende maquinaria hoy. Muy pronto, traspasos de negocios, talento y ofertas.",
  },
];

export default async function LandingPage() {
  const destacados = (await getAnunciosMaquinaria()).slice(0, 3);

  return (
    <>
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
          <nav className="flex items-center gap-6 text-sm text-background/85">
            <Link href="/catalogo" className="hidden transition-colors hover:text-gold sm:inline">
              Catálogo
            </Link>
            <Link href="/publicar" className="hidden transition-colors hover:text-gold sm:inline">
              Publicar
            </Link>
            <Link
              href="/login"
              className="border-b border-gold/60 pb-0.5 transition-colors hover:text-gold"
            >
              Iniciar sesión
            </Link>
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
      {destacados.length > 0 && (
        <section className="bg-cream px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-[0.24em] text-gold">
                  Destacados
                </span>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-4xl">
                  Equipos seleccionados
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="text-sm text-foreground underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
              >
                Ver todo el catálogo
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {destacados.map((anuncio, i) => (
                <AnuncioCard key={anuncio.id} anuncio={anuncio} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA -- dark moment */}
      <section className="bg-foreground px-6 py-20 text-background md:px-12 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-xl font-serif text-3xl leading-tight md:text-4xl">
              ¿Tienes equipo profesional para vender?
            </h2>
            <p className="mt-3 max-w-md text-background/75">
              Publícalo hoy y llega a compradores del sector en toda España.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-sm">
            <Link href="/publicar">Publicar un anuncio</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
