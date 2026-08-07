import { notFound } from "next/navigation";
import { getAnuncioById } from "@/lib/actions/anuncios";
import { tieneConversacionConAnuncio } from "@/lib/actions/mensajes";
import { createClient } from "@/lib/supabase/server";
import { AnuncioFicha } from "@/components/anuncio/AnuncioFicha";

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

  // Traspaso confidentiality (quick version): the owner's identity stays hidden
  // until the interested party has logged in AND contacted. Always revealed to
  // the owner. Maquinaria has no such tier.
  const esTraspaso = anuncio.tipo === "TRASPASO";
  const esPropio = user?.id === anuncio.propietarioId;
  const haContactado =
    esTraspaso && !esPropio && user
      ? await tieneConversacionConAnuncio(anuncio.id)
      : false;
  const identidadOculta = esTraspaso && !esPropio && !haContactado;

  return (
    <AnuncioFicha
      anuncio={anuncio}
      loggedIn={!!user}
      currentUserId={user?.id}
      confidencial={esTraspaso}
      identidadOculta={identidadOculta}
    />
  );
}
