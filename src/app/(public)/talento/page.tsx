import Link from "next/link";
import { getCvs } from "@/lib/actions/talento";
import type { TalentoFiltros } from "@/types/talento";
import { FiltroTalentoBar } from "@/components/talento/FiltroTalentoBar";
import { TalentoCatalogoClient } from "@/components/talento/TalentoCatalogoClient";

export const dynamic = "force-dynamic";

export default async function TalentoPage(props: PageProps<"/talento">) {
  const params = await props.searchParams;
  const filtros: TalentoFiltros = {
    puesto: typeof params.puesto === "string" ? params.puesto : undefined,
    // FiltroCiudad (reused) writes the `ciudad` param -> maps to provincia here.
    provincia: typeof params.ciudad === "string" ? params.ciudad : undefined,
    q: typeof params.q === "string" ? params.q : undefined,
  };

  const cvs = await getCvs(filtros);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl bg-cream px-6 py-9 md:px-10 md:py-11">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Talento del sector belleza
          </span>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Talento
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Encuentra profesionales de la belleza para tu negocio.
          </p>
        </div>
        <Link
          href="/talento/mi-cv"
          className="text-sm text-foreground underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
        >
          Publicar mi CV
        </Link>
      </div>
      <FiltroTalentoBar />
      <TalentoCatalogoClient filtros={filtros} initialData={cvs} />
    </div>
  );
}
