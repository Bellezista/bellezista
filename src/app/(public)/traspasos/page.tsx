import { getAnunciosTraspaso } from "@/lib/actions/anuncios";
import type { CatalogoFiltros } from "@/types/anuncio";
import { FiltroTraspasoBar } from "@/components/catalogo/FiltroTraspasoBar";
import { TraspasoCatalogoClient } from "@/components/catalogo/TraspasoCatalogoClient";

export const dynamic = "force-dynamic";

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
      <div className="rounded-xl bg-cream px-6 py-9 md:px-10 md:py-11">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          Traspaso de negocios
        </span>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground md:text-4xl">
          Traspasos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compra y traspasa negocios del sector de la belleza en España.
        </p>
      </div>
      <FiltroTraspasoBar />
      <TraspasoCatalogoClient filtros={filtros} initialData={anuncios} />
    </div>
  );
}
