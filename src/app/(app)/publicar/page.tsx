import Link from "next/link";
import { LayoutGrid, Store, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

// The platform has several listing modules, so publishing starts with a
// choice. (Ofertas is parked for now at the client's request.)
const OPCIONES = [
  {
    href: "/publicar/traspaso",
    icon: Store,
    titulo: "Traspaso",
    texto: "Traspasa tu negocio de belleza: centro, peluquería, clínica, etc.",
  },
  {
    href: "/publicar/maquinaria",
    icon: LayoutGrid,
    titulo: "Maquinaria",
    texto: "Vende equipamiento de estética: aparatología, mobiliario y más.",
  },
] as const;

export default function PublicarPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Publicar"
        title="¿Qué quieres publicar?"
        subtitle="Elige el tipo de anuncio para empezar."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {OPCIONES.map((o) => {
          const Icon = o.icon;
          return (
            <Link
              key={o.href}
              href={o.href}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
            >
              <Icon className="size-6 text-gold" aria-hidden="true" />
              <h2 className="font-serif text-xl text-foreground">{o.titulo}</h2>
              <p className="text-sm text-muted-foreground">{o.texto}</p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
                Continuar
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
