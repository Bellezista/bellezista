import { SearchX } from "lucide-react";
import type { CvResumen } from "@/types/talento";
import { CvCard } from "@/components/talento/CvCard";

export function CvGrid({ cvs }: { cvs: CvResumen[] }) {
  if (cvs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          No se encontraron perfiles con estos filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cvs.map((cv) => (
        <CvCard key={cv.id} cv={cv} />
      ))}
    </div>
  );
}
