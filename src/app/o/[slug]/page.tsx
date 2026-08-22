import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { formatPrecio } from "@/lib/format";
import { TIPO_NEGOCIO_TRASPASO_LABEL } from "@/lib/anuncio/labels";

export const dynamic = "force-dynamic";

// Isolated public offer landing (Ofertas module). Deliberately NOT inside the
// (public)/(app) shells -- no sidebar, topbar, menu or search. A consumer lands
// here from a link the business shares, sees one offer, and contacts by
// WhatsApp. Traffic is external, so there is no catalog for this module.

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]!.charAt(0) + p[p.length - 1]!.charAt(0)).toUpperCase();
}

async function getOferta(slug: string) {
  const oferta = await prisma.oferta.findUnique({
    where: { slug },
    include: { propietario: { select: { nombre: true } } },
  });
  if (!oferta) return null;
  const vigente =
    oferta.estado === "ACTIVA" &&
    (!oferta.fechaCaducidad || oferta.fechaCaducidad.getTime() > Date.now());
  return { oferta, vigente };
}

export async function generateMetadata({
  params,
}: PageProps<"/o/[slug]">) {
  const { slug } = await params;
  const data = await getOferta(slug);
  if (!data?.vigente) return { title: "Oferta · Bellezista" };
  return {
    title: `${data.oferta.titulo} · ${data.oferta.propietario.nombre}`,
    description: data.oferta.descripcion,
  };
}

export default async function OfertaLandingPage({
  params,
}: PageProps<"/o/[slug]">) {
  const { slug } = await params;
  const data = await getOferta(slug);

  // Not found, unpaid, or expired: a minimal standalone notice (still no shell).
  if (!data || !data.vigente) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <p className="font-serif text-xl text-foreground">Oferta no disponible</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta oferta ha caducado o ya no está activa.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-sm font-bold text-foreground"
          >
            Bellez<span className="text-gold">i</span>sta
          </Link>
        </div>
      </main>
    );
  }

  const o = data.oferta;
  const negocio = o.propietario.nombre;
  const badge = o.vigencia === "DIARIA" ? "Oferta hoy" : "Oferta esta semana";
  const waText = encodeURIComponent(
    `Hola, vi vuestra oferta "${o.titulo}" en Bellezista`,
  );
  const waHref = `https://wa.me/${o.whatsapp}?text=${waText}`;
  const validoHasta = o.fechaCaducidad
    ? `Oferta válida hasta el ${o.fechaCaducidad.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      })}`
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
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
              {iniciales(negocio)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{negocio}</p>
              <p className="text-xs text-muted-foreground">
                {[o.ciudadProvincia, TIPO_NEGOCIO_TRASPASO_LABEL[o.tipoNegocio]]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
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
            <span className="font-serif text-2xl text-gold">
              {formatPrecio(o.precio.toString())}
            </span>
            {o.precioOriginal && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrecio(o.precioOriginal.toString())}
              </span>
            )}
          </div>

          {/* WhatsApp */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block rounded-lg bg-gold py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-gold/90"
          >
            Reservar por WhatsApp
          </a>

          {validoHasta && (
            <p className="mt-3 pb-5 text-center text-xs text-muted-foreground">
              {validoHasta}
            </p>
          )}
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
