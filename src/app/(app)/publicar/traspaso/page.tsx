import { TraspasoStepper } from "@/components/publicar/TraspasoStepper";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PublicarTraspasoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Nuevo traspaso"
        title="Publicar traspaso"
        subtitle="Publica el traspaso de tu negocio de belleza en unos pocos pasos."
      />
      <TraspasoStepper />
    </div>
  );
}
