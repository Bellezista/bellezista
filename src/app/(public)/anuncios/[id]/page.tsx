import { notFound } from "next/navigation";
import { getAnuncioById } from "@/lib/actions/anuncios";
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

  return (
    <AnuncioFicha
      anuncio={anuncio}
      loggedIn={!!user}
      currentUserId={user?.id}
    />
  );
}
