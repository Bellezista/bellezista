import Image from "next/image";
import Link from "next/link";
import { getAnunciosTraspaso } from "@/lib/actions/anuncios";
import type { CatalogoFiltros } from "@/types/anuncio";
import { Button } from "@/components/ui/button";
import { FiltroTraspasoBar } from "@/components/catalogo/FiltroTraspasoBar";
import { TraspasoCatalogoClient } from "@/components/catalogo/TraspasoCatalogoClient";

export const dynamic = "force-dynamic";

const HEADER_IMG =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site/hero-salon.jpg";

function numParam(v: string | string[] | undefined): number | undefined {
  if (typeof v !== "string") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function TraspasosPage(props: PageProps<"/traspasos">) {
  const params = await props.searchParams;
  const filtros: CatalogoFiltros = {
    ciudad: typeof params.ciudad === "string" ? params.ciudad : undefined,
    q: typeof params.q === "string" ? params.q : undefined,
    tipoNegocio:
      typeof params.tipoNegocio === "string" ? params.tipoNegocio : undefined,
    precioMin: numParam(params.precioMin),
    precioMax: numParam(params.precioMax),
  };

  const anuncios = await getAnunciosTraspaso(filtros);

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-xl">
        <Image
          src={HEADER_IMG}
          alt="Negocio del sector de la belleza"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#262420]/85 via-[#262420]/65 to-[#262420]/35" />
        <div className="px-6 py-12 md:px-10 md:py-16">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Traspaso de negocios
          </span>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-background md:text-4xl">
            Traspasos
          </h1>
          <p className="mt-2 font-serif text-lg italic text-gold md:text-xl">
            Tu próxima gran oportunidad empieza aquí
          </p>
          <p className="mt-2 max-w-md text-sm text-background/80">
            Compra y traspasa negocios del sector de la belleza en España.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 h-12 rounded-full bg-gold px-8 text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            <Link href="/publicar/traspaso">Quiero publicar un anuncio</Link>
          </Button>
        </div>
      </section>
      <FiltroTraspasoBar />
      <TraspasoCatalogoClient filtros={filtros} initialData={anuncios} />
    </div>
  );
}
