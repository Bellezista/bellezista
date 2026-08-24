"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CirclePlus,
  FileText,
  LayoutGrid,
  List,
  MessageCircle,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { UnreadBadge } from "@/components/layout/UnreadBadge";
import { useConteoNoLeidos } from "@/hooks/useConteoNoLeidos";

const NAV_ITEMS = [
  { href: "/traspasos", label: "Traspasos", icon: Store },
  { href: "/catalogo", label: "Maquinaria", icon: LayoutGrid },
  { href: "/talento", label: "Empleo & Talento", icon: Users },
  { href: "/publicar", label: "Publicar anuncio", icon: CirclePlus },
  { href: "/talento/mi-cv", label: "Mi CV", icon: FileText },
  { href: "/mis-anuncios", label: "Mis anuncios", icon: List },
  { href: "/mis-compras", label: "Mis compras", icon: ShoppingBag },
  { href: "/mis-ventas", label: "Mis ventas", icon: Wallet },
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
    <aside className="hidden text-background md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:overflow-y-auto md:border-r md:border-white/10 md:bg-foreground">
      <Link href="/" className="flex flex-col gap-1 px-6 py-8" aria-label="Ir al inicio">
        <Logo className="text-xl text-background" />
        <span className="text-xs text-gold">El mundo de la belleza</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Fragment key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-l-gold bg-gold/10 font-semibold text-gold"
                    : "text-background/75 hover:bg-white/5 hover:text-background",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {item.href === "/mensajes" && (
                  <UnreadBadge
                    count={noLeidos ?? 0}
                    className="ml-auto bg-background text-foreground"
                  />
                )}
              </Link>
              {item.href === "/talento" && (
                <div className="mx-3 h-px bg-white/10" aria-hidden="true" />
              )}
            </Fragment>
          );
        })}
      </nav>

      {/* Active-listings counter temporarily hidden at the client's request:
          with few listings early on, showing a number reads as "empty". The
          `anunciosActivos` prop is kept wired so this can be restored later by
          re-adding the block below.
          {typeof anunciosActivos === "number" && (
            <div className="mt-auto px-6 py-6">
              <p className="text-xs text-background/60">
                <span className="font-medium text-background">{anunciosActivos}</span>{" "}
                {anunciosActivos === 1 ? "anuncio activo" : "anuncios activos"}
              </p>
            </div>
          )} */}
    </aside>
  );
}
