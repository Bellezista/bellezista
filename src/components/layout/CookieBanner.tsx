"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "bellezista_cookie_consent";

// Site-wide cookie consent banner. Shows on the first visit until the visitor
// accepts or rejects; the choice is stored per-browser so it doesn't reappear.
// Reject is offered as prominently as Accept (GDPR).
export function CookieBanner() {
  // null = not decided yet (show banner). Start hidden to avoid a flash before
  // we can read localStorage on the client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // Private mode / storage blocked: show the banner but it won't persist.
      setVisible(true);
    }
  }, []);

  function decidir(valor: "accepted" | "rejected") {
    try {
      localStorage.setItem(STORAGE_KEY, valor);
    } catch {
      // Ignore: can't persist, just close for this session.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-cream px-4 py-4 shadow-[0_-6px_20px_rgba(44,44,42,0.12)] md:px-8"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-foreground">
          Usamos cookies propias y de terceros para el funcionamiento del sitio y
          para mejorar tu experiencia. Puedes aceptarlas o rechazarlas.{" "}
          <Link
            href="/cookies"
            className="font-semibold text-gold underline underline-offset-4"
          >
            Más información
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => decidir("rejected")}
          >
            Rechazar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => decidir("accepted")}
            className="bg-gold font-semibold text-foreground hover:bg-gold/90"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
