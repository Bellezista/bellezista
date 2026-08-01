import Image from "next/image";
import Link from "next/link";
import { BackButton } from "./BackButton";

// Isolated public offer landing (Ofertas module). Deliberately NOT inside the
// (public)/(app) shells -- no sidebar, topbar, menu or search. A consumer lands
// here from a link/QR the business shares, sees one offer, and contacts by
// WhatsApp. Traffic is external, so there is no catalog for this module.
//
// PREVIEW: renders a demo offer for any slug so the client can review the design
// (per his mockup) before we build the create-form + data model + pay-per-offer
// checkout. Real offers will come from an Oferta record.

const DEMO_OFERTA = {
  negocio: "Laservell@s",
  iniciales: "LV",
  ubicacion: "Barcelona · Gran Via",
  vigencia: "semanal" as "semanal" | "diaria",
  titulo: "-30% en Depilación Láser",
  descripcion:
    "Sesión completa de piernas y axilas con tecnología de diodo. Válido hasta el domingo.",
  precio: "49 €",
  precioAnterior: "70 €",
  validoHasta: "Oferta válida hasta el 3 de agosto",
  foto: "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/demo/laser-diodo.jpg",
  whatsapp:
    "https://wa.me/34600000000?text=Hola,%20vi%20vuestra%20oferta%20en%20Bellezista",
};

export const metadata = {
  title: `${DEMO_OFERTA.titulo} · ${DEMO_OFERTA.negocio}`,
  description: DEMO_OFERTA.descripcion,
};

export default function OfertaLandingPage() {
  const o = DEMO_OFERTA;
  const badge = o.vigencia === "diaria" ? "Oferta hoy" : "Oferta esta semana";

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <BackButton />
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        {/* Imagen + badge */}
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={o.foto}
            alt={o.titulo}
            fill
            sizes="420px"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-foreground/35" />
          <span className="absolute left-4 top-4 rounded-md bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">
            {badge}
          </span>
        </div>

        <div className="px-6 pt-5">
          {/* Negocio */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-foreground text-sm font-bold text-gold">
              {o.iniciales}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{o.negocio}</p>
              <p className="text-xs text-muted-foreground">{o.ubicacion}</p>
            </div>
          </div>

          {/* Oferta */}
          <h1 className="font-serif text-2xl leading-tight text-foreground">
            {o.titulo}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {o.descripcion}
          </p>

          {/* Precio */}
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="font-serif text-2xl text-gold">{o.precio}</span>
            {o.precioAnterior && (
              <span className="text-sm text-muted-foreground line-through">
                {o.precioAnterior}
              </span>
            )}
          </div>

          {/* WhatsApp */}
          <a
            href={o.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block rounded-lg bg-gold py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-gold/90"
          >
            Reservar por WhatsApp
          </a>

          <p className="mt-3 pb-5 text-center text-xs text-muted-foreground">
            {o.validoHasta}
          </p>
        </div>

        {/* Crédito Bellezista */}
        <div className="border-t border-border px-6 py-3 text-center text-[11px] text-muted-foreground">
          Página de oferta creada con{" "}
          <Link href="/" className="font-bold text-foreground">
            Bellez<span className="text-gold">i</span>sta
          </Link>
        </div>
      </div>
    </main>
  );
}
