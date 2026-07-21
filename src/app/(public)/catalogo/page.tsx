import { getAnunciosMaquinaria } from "@/lib/actions/anuncios";
import type { CatalogoFiltros } from "@/types/anuncio";
import { FiltroBar } from "@/components/catalogo/FiltroBar";
import { CatalogoClient } from "@/components/catalogo/CatalogoClient";

export const dynamic = "force-dynamic";

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
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Catálogo
        </h1>
        <p className="text-sm text-muted-foreground">
          Maquinaria de estética en un solo lugar
        </p>
      </div>
      <FiltroBar />
      <CatalogoClient filtros={filtros} initialData={anuncios} />
    </div>
  );
}
