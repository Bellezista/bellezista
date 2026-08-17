import { notFound, redirect } from "next/navigation";
import { getAnuncioById } from "@/lib/actions/anuncios";
import { createClient } from "@/lib/supabase/server";
import { PublishStepper } from "@/components/publicar/PublishStepper";
import { TraspasoStepper } from "@/components/publicar/TraspasoStepper";
import { PageHeader } from "@/components/layout/PageHeader";
import type { PublicarMaquinariaInput } from "@/lib/validation/publicarMaquinariaSchema";
import type { PublicarTraspasoInput } from "@/lib/validation/publicarTraspasoSchema";

export default async function EditarAnuncioPage(
  props: PageProps<"/publicar/editar/[id]">,
) {
  const { id } = await props.params;
  const anuncio = await getAnuncioById(id);
  if (!anuncio) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== anuncio.propietarioId) redirect("/mis-anuncios");

  if (anuncio.maquinaria) {
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
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader title="Editar anuncio" />
        <PublishStepper anuncioId={anuncio.id} defaultValues={defaultValues} />
      </div>
    );
  }

  if (anuncio.traspaso) {
    const { traspaso } = anuncio;
    const defaultValues: Partial<PublicarTraspasoInput> = {
      titulo: anuncio.titulo,
      precio: Number(anuncio.precio),
      ciudadProvincia: anuncio.ciudadProvincia,
      fotos: anuncio.fotos,
      tipoNegocio: traspaso.tipoNegocio,
      tipoAnunciante: traspaso.tipoAnunciante,
      descripcion: traspaso.descripcion ?? undefined,
      metrosCuadrados: traspaso.metrosCuadrados ?? undefined,
      cabinas: traspaso.cabinas ?? undefined,
      personal: traspaso.personal ?? undefined,
      alquilerMensual: traspaso.alquilerMensual
        ? Number(traspaso.alquilerMensual)
        : undefined,
      tipoLicencia: traspaso.tipoLicencia ?? undefined,
    };
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader title="Editar traspaso" />
        <TraspasoStepper anuncioId={anuncio.id} defaultValues={defaultValues} />
      </div>
    );
  }

  notFound();
}
