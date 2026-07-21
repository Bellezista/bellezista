import { notFound, redirect } from "next/navigation";
import { getAnuncioById } from "@/lib/actions/anuncios";
import { createClient } from "@/lib/supabase/server";
import { PublishStepper } from "@/components/publicar/PublishStepper";
import type { PublicarMaquinariaInput } from "@/lib/validation/publicarMaquinariaSchema";

export default async function EditarAnuncioPage(
  props: PageProps<"/publicar/editar/[id]">,
) {
  const { id } = await props.params;
  const anuncio = await getAnuncioById(id);
  if (!anuncio || !anuncio.maquinaria) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== anuncio.propietarioId) redirect("/mis-anuncios");

  const { maquinaria } = anuncio;
  const defaultValues: Partial<PublicarMaquinariaInput> = {
    titulo: anuncio.titulo,
    precio: Number(anuncio.precio),
    ciudadProvincia: anuncio.ciudadProvincia,
    fotos: anuncio.fotos,
    categoria: maquinaria.categoria,
    subcategoria: maquinaria.subcategoria ?? undefined,
    marca: maquinaria.marca,
    modelo: maquinaria.modelo,
    numeroSerie: maquinaria.numeroSerie ?? undefined,
    anio: maquinaria.anio ?? undefined,
    horasDeUso: maquinaria.horasDeUso ?? undefined,
    beautyScore: maquinaria.beautyScore
      ? Number(maquinaria.beautyScore)
      : undefined,
    estadoEquipo: maquinaria.estadoEquipo,
    nivelDeServicio: maquinaria.nivelDeServicio,
    esMedicoEstetico: maquinaria.esMedicoEstetico,
    descripcion: maquinaria.descripcion ?? undefined,
    video: maquinaria.video ?? undefined,
    factura: maquinaria.factura ?? undefined,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Editar anuncio
        </h1>
      </div>
      <PublishStepper anuncioId={anuncio.id} defaultValues={defaultValues} />
    </div>
  );
}
