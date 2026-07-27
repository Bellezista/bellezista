import Link from "next/link";

const ENLACES = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/publicar", label: "Publicar" },
  { href: "/contacto", label: "Contacto" },
] as const;

// Slim closing footer matching the client's mockup (Phase 1 review): a single
// thin bar with the copyright on the left and a few links on the right, so
// pages don't end abruptly against the background. The year is computed on the
// server at render time -- no client hydration needed.
export function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border">
      <div className="flex flex-col-reverse gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-xs text-muted-foreground">
          &copy; {anio} Bellezista
        </p>

        <nav
          aria-label="Enlaces del pie de página"
          className="flex items-center gap-x-3 text-sm text-muted-foreground"
        >
          {ENLACES.map((enlace, i) => (
            <span key={enlace.href} className="flex items-center gap-x-3">
              {i > 0 && (
                <span aria-hidden="true" className="text-border">
                  &middot;
                </span>
              )}
              <Link
                href={enlace.href}
                className="transition-colors hover:text-foreground"
              >
                {enlace.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
