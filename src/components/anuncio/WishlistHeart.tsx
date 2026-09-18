"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

// Visual wishlist toggle for the catalog cards. Sits over the card (not nested
// in its <Link>) so clicks don't navigate. NOTE: local-only for now -- it does
// not persist yet; wiring it needs a favoritos/wishlist model + auth.
export function WishlistHeart({ className = "" }: { className?: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? "Quitar de guardados" : "Guardar anuncio"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((v) => !v);
      }}
      className={`flex size-9 items-center justify-center rounded-full border border-white/50 bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/35 ${className}`}
    >
      <Heart
        className={`size-4 transition-colors ${saved ? "fill-white text-white" : "text-white"}`}
        aria-hidden="true"
      />
    </button>
  );
}
