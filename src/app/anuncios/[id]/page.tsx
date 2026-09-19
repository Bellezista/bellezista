import Link from "next/link";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getAnuncioById,
  registrarVistaAnuncio,
} from "@/lib/actions/anuncios";
import { tieneConversacionConAnuncio } from "@/lib/actions/mensajes";
import { createClient } from "@/lib/supabase/server";
import { AnuncioFicha } from "@/components/anuncio/AnuncioFicha";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export default async function AnuncioDetallePage(
  props: PageProps<"/anuncios/[id]">,
) {
  const { id } = await props.params;
  const anuncio = await getAnuncioById(id);
  if (!anuncio) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esTraspaso = anuncio.tipo === "TRASPASO";
  const esPropio = user?.id === anuncio.propietarioId;

  if (!esPropio) {
    after(() => registrarVistaAnuncio(id).catch(() => {}));
  }
  const haContactado =
    esTraspaso && !esPropio && user
      ? await tieneConversacionConAnuncio(anuncio.id)
      : false;
  const identidadOculta = esTraspaso && !esPropio && !haContactado;

  const backHref = esTraspaso ? "/traspasos" : "/catalogo";
  const backLabel = esTraspaso ? "Traspasos" : "Maquinaria";

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <PortadaNav loggedIn={!!user} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver a {backLabel}
          </Link>

          <AnuncioFicha
            anuncio={anuncio}
            loggedIn={!!user}
            currentUserId={user?.id}
            confidencial={esTraspaso}
            identidadOculta={identidadOculta}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
