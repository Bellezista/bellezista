import { PublishStepper } from "@/components/publicar/PublishStepper";

export default function PublicarPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Publicar anuncio
        </h1>
        <p className="text-sm text-muted-foreground">
          Completá los datos de tu equipo en unos pocos pasos.
        </p>
      </div>
      <PublishStepper />
    </div>
  );
}
