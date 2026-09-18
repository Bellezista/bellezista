"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrecio } from "@/lib/format";

type Item = {
  id: string;
  tipo: string;
  titulo: string;
  precio: number;
  ciudadProvincia: string;
  fotos: string[];
};

// Horizontal, arrow-controlled carousel of the newest real listings.
export function UltimosAnuncios({ items }: { items: Item[] }) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    track.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="min-w-0 pl-6 pt-2 md:pl-10 lg:pl-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-[0.95rem] font-semibold uppercase tracking-[0.2em] text-foreground">
            Últimos anuncios
          </span>
          <div className="mt-4 h-0.5 w-14 bg-gold" />
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scroll(-1)}
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scroll(1)}
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((a) => {
          const esTraspaso = a.tipo === "TRASPASO";
          return (
            <Link
              key={a.id}
              href={`/anuncios/${a.id}`}
              className="group w-[240px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(20,19,16,.04),0_10px_24px_rgba(20,19,16,.07)] transition-shadow hover:shadow-[0_16px_34px_rgba(20,19,16,.13)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                <span
                  className={`absolute left-3 top-3 z-10 rounded-sm px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] ${
                    esTraspaso
                      ? "bg-gold text-foreground"
                      : "bg-[#171512] text-white"
                  }`}
                >
                  {esTraspaso ? "Traspaso" : "Venta"}
                </span>
                {a.fotos[0] && (
                  <Image
                    src={a.fotos[0]}
                    alt=""
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <div className="p-4">
                <h4 className="font-serif text-[1rem] leading-snug text-foreground">
                  {a.titulo}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.ciudadProvincia}
                </p>
                <p className="mt-2 font-serif text-lg text-gold">
                  {formatPrecio(a.precio)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
