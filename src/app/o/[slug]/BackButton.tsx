"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// Browser "back" only -- goes to wherever the visitor came from. Deliberately
// NOT a link into Bellezista, so the offer page stays isolated (client spec:
// no navigation to the rest of the platform).
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Volver"
      className="fixed left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-2 text-sm text-muted-foreground shadow-[var(--shadow-card)] ring-1 ring-border backdrop-blur transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      Volver
    </button>
  );
}
