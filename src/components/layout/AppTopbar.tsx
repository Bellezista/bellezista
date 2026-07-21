import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function obtenerIniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return "?";
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function AppTopbar({
  userNombre,
  mobileNav,
}: {
  // null on public pages (/catalogo, /anuncios/[id]) viewed while logged out
  // -- browsing doesn't require an account, see (public)/layout.tsx.
  userNombre: string | null;
  mobileNav?: React.ReactNode;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      {/* El botón de menú móvil (hamburguesa) vive en MobileNav.tsx, no aquí. */}
      <div className="mobile-nav-slot md:hidden">{mobileNav}</div>

      <div className="flex flex-1 items-center justify-end gap-3">
        {userNombre ? (
          <>
            <span className="text-sm text-foreground">{userNombre}</span>
            <Avatar>
              <AvatarFallback>{obtenerIniciales(userNombre)}</AvatarFallback>
            </Avatar>
          </>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
