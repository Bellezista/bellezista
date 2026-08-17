import { Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComprarKitButton } from "@/components/traspaso/ComprarKitButton";
import { KIT_VENTAJAS, KIT_INFO_NECESARIA } from "@/lib/traspaso/kit";

export default async function KitTraspasoPage(
  props: PageProps<"/kit-traspaso">,
) {
  const sp = await props.searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Traspasos"
        title="Kit Traspaso · 149€"
        subtitle="Pago único. La documentación para cerrar tu traspaso con seguridad."
      />

      {sp.pago === "cancel" && (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Has cancelado el pago. Puedes comprar el Kit cuando quieras.
        </p>
      )}

      <div className="space-y-6 rounded-xl border border-border bg-card p-6 md:p-8">
        <p className="text-sm leading-relaxed text-foreground">
          Vender un negocio sin la documentación adecuada es arriesgado: un mal
          contrato puede dejarte sin cobrar lo pactado o generarte problemas
          legales después de la firma. El Kit Traspaso te da, preparado por
          especialistas en traspasos de negocios de belleza, todo lo que
          necesitas para cerrar tu operación con seguridad:
        </p>

        <ul className="space-y-3">
          {KIT_VENTAJAS.map((v) => (
            <li key={v} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-sm text-foreground">{v}</span>
            </li>
          ))}
        </ul>

        <p className="rounded-lg bg-cream px-4 py-3 text-sm leading-relaxed text-foreground">
          A modo de referencia, un abogado especializado suele cobrar bastante
          más solo por la redacción del contrato. Con el Kit Traspaso tienes la
          tranquilidad de una documentación profesional a una fracción de ese
          coste.
        </p>

        <details className="group rounded-lg border border-border">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="text-gold transition-transform group-open:rotate-90">
                ›
              </span>
              ¿Qué necesitamos para preparar tus documentos?
            </span>
          </summary>
          <div className="border-t border-border px-4 py-3">
            <p className="mb-2 text-sm text-muted-foreground">
              Una vez completes la compra, te pediremos:
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
              {KIT_INFO_NECESARIA.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </details>

        <div className="border-t border-border pt-6">
          <ComprarKitButton />
        </div>
      </div>
    </div>
  );
}
