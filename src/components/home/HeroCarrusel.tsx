import Link from "next/link";

const BANNER =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site/hero-banner.jpg";

// Full-width editorial banner: the client's beauty image (model on the right,
// open cream space on the left) carries the composition. Dark serif text sits on
// the cream left; a soft cream gradient keeps it readable on every screen size.
export function HeroCarrusel() {
  return (
    <section className="relative flex min-h-[500px] items-center overflow-hidden bg-[#efe9df] md:min-h-[580px]">
      <img
        src={BANNER}
        alt="Profesional del sector de la belleza"
        className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#efe9df] via-[#efe9df]/85 to-transparent md:from-[#efe9df] md:via-[#efe9df]/75 md:via-25% md:to-transparent md:to-52%" />

      <div className="relative w-full px-6 md:pl-14 lg:pl-20">
        <div className="relative max-w-[46rem] py-12 md:py-16 md:pl-9">
          <span className="absolute left-0 top-12 hidden h-[calc(100%-6rem)] w-[3px] bg-gold md:block" />
          <h1 className="font-serif text-[2.5rem] leading-[1.06] text-foreground md:text-[3.6rem]">
            El punto de encuentro{" "}
            <br className="hidden md:inline" />
            del sector beauty
          </h1>
          <p className="mt-6 max-w-[38ch] text-base leading-relaxed text-muted-foreground md:text-[1.1rem]">
            Negocios, talento, formación y oportunidades para profesionales que
            quieren crecer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/traspasos"
              className="rounded-sm bg-[#171512] px-7 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black"
            >
              Explora anuncios
            </Link>
            <Link
              href="/registro"
              className="rounded-sm border border-gold px-7 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-foreground"
            >
              Únete a Bellezista
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay tagline over the photo, bottom-right (per the design). Dark
          tone so it reads over the light/cream part of the image. */}
      <div className="absolute bottom-8 right-8 hidden text-right text-[0.78rem] font-semibold uppercase leading-[2] tracking-[0.3em] text-[#4a4238] [text-shadow:0_1px_2px_rgba(255,255,255,0.35)] lg:block">
        Belleza.<br />Tu profesional<br />Oportunidades<br />Reales
      </div>
    </section>
  );
}
