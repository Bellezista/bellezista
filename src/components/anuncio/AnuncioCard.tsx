import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";
import type { AnuncioSerializado } from "@/types/anuncio";
import { cn } from "@/lib/utils";
import { atributosCardDe, categoriaLabelDe } from "@/lib/anuncio/subtype-adapters";
import { formatPrecio } from "@/lib/format";
import { WishlistHeart } from "@/components/anuncio/WishlistHeart";

interface AnuncioCardProps {
  anuncio: AnuncioSerializado;
  priority?: boolean;
  destacado?: boolean;
}

const DIAS_NOVEDAD = 14;

// Reusable marketplace catalog card (redesign). Subtype-agnostic: attributes and
// category come from the subtype adapters, so it works for Maquinaria and
// Traspaso alike. Featured listings get a gold frame + "Destacado" badge;
// recent ones get a "Novedad" badge.
export function AnuncioCard({
  anuncio,
  priority = false,
  destacado = false,
}: AnuncioCardProps) {
  const portada = anuncio.fotos[0];
  const chips = atributosCardDe(anuncio).slice(0, 3);
  const categoria = categoriaLabelDe(anuncio);
  const esNovedad =
    !destacado &&
    Date.now() - new Date(anuncio.creadoEn).getTime() <
      DIAS_NOVEDAD * 24 * 60 * 60 * 1000;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-[#f6f2ea] shadow-[0_1px_2px_rgba(20,19,16,.04),0_10px_24px_rgba(20,19,16,.07)] transition-shadow duration-300 hover:shadow-[0_16px_34px_rgba(20,19,16,.13)]",
        destacado ? "border-2 border-gold" : "border border-border",
      )}
    >
      <WishlistHeart className="absolute right-3 top-3 z-20" />

      <Link href={`/anuncios/${anuncio.id}`} className="flex flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
          {/* Badges stack: Destacado/Novedad coexists with Confidencial */}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {(destacado || esNovedad) && (
              <span
                className={cn(
                  "rounded-sm px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em]",
                  destacado
                    ? "bg-gold text-foreground"
                    : "bg-cream text-foreground",
                )}
              >
                {destacado ? "Destacado" : "Novedad"}
              </span>
            )}
            {anuncio.tipo === "TRASPASO" && (
              <span className="rounded-sm bg-white/90 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-foreground backdrop-blur-sm">
                Confidencial
              </span>
            )}
          </div>
          {portada ? (
            <>
              <Image
                src={portada}
                alt={anuncio.titulo}
                fill
                sizes="(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw"
                priority={priority}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              {/* Dark veil over the image for a premium feel + badge legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/25" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-4" aria-hidden="true" />
              <span className="text-sm">Sin fotos</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-5">
          <h3 className="line-clamp-2 font-serif text-[1.15rem] leading-snug text-foreground">
            {anuncio.titulo}
          </h3>

          <p className="text-[0.8rem] text-muted-foreground">
            {categoria
              ? `${categoria} · ${anuncio.ciudadProvincia}`
              : anuncio.ciudadProvincia}
          </p>

          {chips.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c.label}
                  className="rounded-sm bg-white px-2 py-0.5 text-[0.66rem] font-medium text-foreground/70"
                >
                  {c.value}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-serif text-xl text-gold">
              {formatPrecio(anuncio.precio.toString())}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-foreground">
              Ver detalle
              <ArrowRight
                className="size-3.5 text-gold transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
