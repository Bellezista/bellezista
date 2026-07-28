"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus, LayoutGrid, List, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { UnreadBadge } from "@/components/layout/UnreadBadge";
import { useConteoNoLeidos } from "@/hooks/useConteoNoLeidos";

const NAV_ITEMS = [
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/publicar", label: "Publicar anuncio", icon: CirclePlus },
  { href: "/mis-anuncios", label: "Mis anuncios", icon: List },
  { href: "/mensajes", label: "Mensajes", icon: MessageCircle },
] as const;

export function AppSidebar({
  isAuthenticated = true,
  anunciosActivos,
}: {
  isAuthenticated?: boolean;
  anunciosActivos?: number;
}) {
  const pathname = usePathname();
  const { data: noLeidos } = useConteoNoLeidos(isAuthenticated);

  return (
    <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:overflow-y-auto md:border-r md:border-border md:bg-background">
      <Link href="/" className="flex flex-col gap-1 px-6 py-8" aria-label="Ir al inicio">
        <Logo className="text-xl" />
        <span className="text-xs text-gold">El mundo de la belleza</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-l-gold bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
              {item.href === "/mensajes" && (
                <UnreadBadge count={noLeidos ?? 0} className="ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {typeof anunciosActivos === "number" && (
        <div className="mt-auto px-6 py-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {anunciosActivos}
            </span>{" "}
            {anunciosActivos === 1 ? "anuncio activo" : "anuncios activos"}
          </p>
        </div>
      )}
    </aside>
  );
}
