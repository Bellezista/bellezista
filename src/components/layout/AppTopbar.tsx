import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificacionesBell } from "@/components/notificaciones/NotificacionesBell";

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
            <NotificacionesBell />
            <UserMenu userNombre={userNombre} />
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
