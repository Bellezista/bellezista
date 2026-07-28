import Link from "next/link";

const ENLACES = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/publicar", label: "Publicar" },
  { href: "/contacto", label: "Contacto" },
] as const;

// Closing footer (client design feedback, Phase 1 review): dark-gray band with
// light text to give the page visual closure. Gold stays a pure accent -- a
// 1-2px top line separating footer from content and the link hover color, never
// a background fill. The year is computed on the server at render time.
export function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-gold bg-foreground text-background">
      <div className="flex flex-col-reverse gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-xs text-background/60">&copy; {anio} Bellezista</p>

        <nav
          aria-label="Enlaces del pie de página"
          className="flex items-center gap-x-3 text-sm text-background/80"
        >
          {ENLACES.map((enlace, i) => (
            <span key={enlace.href} className="flex items-center gap-x-3">
              {i > 0 && (
                <span aria-hidden="true" className="text-background/30">
                  &middot;
                </span>
              )}
              <Link
                href={enlace.href}
                className="transition-colors hover:text-gold"
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
