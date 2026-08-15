import Link from "next/link";
import { ArrowRight, MapPin, UserRound } from "lucide-react";
import type { CvResumen } from "@/types/talento";
import {
  PUESTO_TALENTO_LABEL,
  JORNADA_TALENTO_LABEL,
  DISPONIBILIDAD_TALENTO_LABEL,
} from "@/lib/anuncio/labels";

// Public teaser card. Deliberately shows no name/photo/contact -- those are
// gated behind the pay-to-access paywall (see the CV detail page).
export function CvCard({ cv }: { cv: CvResumen }) {
  return (
    <Link
      href={`/talento/${cv.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-foreground/15 bg-card p-5 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          {PUESTO_TALENTO_LABEL[cv.puesto]}
        </span>
      </div>

      <h3 className="mt-4 font-serif text-lg leading-snug text-foreground">
        {cv.aniosExperiencia}{" "}
        {cv.aniosExperiencia === 1 ? "año" : "años"} de experiencia
      </h3>

      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{cv.provincia}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">
          {JORNADA_TALENTO_LABEL[cv.jornada]} ·{" "}
          {DISPONIBILIDAD_TALENTO_LABEL[cv.disponibilidad]}
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
