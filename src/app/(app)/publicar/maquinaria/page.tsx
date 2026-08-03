import { PublishStepper } from "@/components/publicar/PublishStepper";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PublicarMaquinariaPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Nuevo anuncio"
        title="Publicar maquinaria"
        subtitle="Completa los datos de tu equipo en unos pocos pasos."
      />
      <PublishStepper />
    </div>
  );
}
