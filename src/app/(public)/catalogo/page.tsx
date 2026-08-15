import Image from "next/image";
import { getAnunciosMaquinaria } from "@/lib/actions/anuncios";
import type { CatalogoFiltros } from "@/types/anuncio";
import { FiltroBar } from "@/components/catalogo/FiltroBar";
import { CatalogoClient } from "@/components/catalogo/CatalogoClient";

export const dynamic = "force-dynamic";

const HEADER_IMG =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site/hero-maquinaria-equipo3.jpg";

export default async function CatalogoPage(props: PageProps<"/catalogo">) {
  const params = await props.searchParams;
  const filtros: CatalogoFiltros = {
    categoria: typeof params.categoria === "string" ? params.categoria : undefined,
    marca: typeof params.marca === "string" ? params.marca : undefined,
    ciudad: typeof params.ciudad === "string" ? params.ciudad : undefined,
    q: typeof params.q === "string" ? params.q : undefined,
  };

  // getAnunciosMaquinaria already returns serialized (Decimal-free) data --
  // see src/lib/actions/anuncios.ts for why that lives in the action itself.
  const anuncios = await getAnunciosMaquinaria(filtros);

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-xl">
        <Image
          src={HEADER_IMG}
          alt="Profesional del sector de la estética"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#262420]/85 via-[#262420]/65 to-[#262420]/35" />
        <div className="px-6 py-12 md:px-10 md:py-16">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Maquinaria profesional
          </span>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-background md:text-4xl">
            Catálogo
          </h1>
          <p className="mt-2 font-serif text-lg italic text-gold md:text-xl">
            El equipo que tu centro merece
          </p>
          <p className="mt-2 max-w-md text-sm text-background/80">
            Compra y vende equipamiento de estética en un solo lugar.
          </p>
        </div>
      </section>
      <FiltroBar />
      <CatalogoClient filtros={filtros} initialData={anuncios} />
    </div>
  );
}
