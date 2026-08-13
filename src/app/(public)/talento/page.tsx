import Image from "next/image";
import Link from "next/link";
import { getCvs } from "@/lib/actions/talento";
import { confirmarSesionCheckout } from "@/lib/talento/otorgar";
import { createClient } from "@/lib/supabase/server";
import type { TalentoFiltros } from "@/types/talento";
import { FiltroTalentoBar } from "@/components/talento/FiltroTalentoBar";
import { TalentoCatalogoClient } from "@/components/talento/TalentoCatalogoClient";

export const dynamic = "force-dynamic";

const HEADER_IMG =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site/hero-talento.jpg";

export default async function TalentoPage(props: PageProps<"/talento">) {
  const params = await props.searchParams;

  // Confirm a bono purchase returning from Stripe (grants credits even before
  // the webhook lands / is configured).
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : null;
  if (sessionId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await confirmarSesionCheckout(sessionId, user.id);
  }

  const filtros: TalentoFiltros = {
    puesto: typeof params.puesto === "string" ? params.puesto : undefined,
    // FiltroCiudad (reused) writes the `ciudad` param -> maps to provincia here.
    provincia: typeof params.ciudad === "string" ? params.ciudad : undefined,
    q: typeof params.q === "string" ? params.q : undefined,
  };

  const cvs = await getCvs(filtros);

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-xl">
        <Image
          src={HEADER_IMG}
          alt="Profesional del sector de la belleza trabajando"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#262420]/85 via-[#262420]/65 to-[#262420]/35" />
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-12 md:px-10 md:py-16">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
              Bolsa de empleo
            </span>
            <h1 className="mt-2 font-serif text-3xl leading-tight text-background md:text-4xl">
              Talento
            </h1>
            <p className="mt-2 font-serif text-lg italic text-gold md:text-xl">
              Los profesionales que tu negocio merece
            </p>
            <p className="mt-2 max-w-md text-sm text-background/80">
              Encuentra profesionales de la belleza para tu negocio.
            </p>
          </div>
          <Link
            href="/talento/mi-cv"
            className="text-sm text-background underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
          >
            Publicar mi CV
          </Link>
        </div>
      </section>
      <FiltroTalentoBar />
      <TalentoCatalogoClient filtros={filtros} initialData={cvs} />
    </div>
  );
}
