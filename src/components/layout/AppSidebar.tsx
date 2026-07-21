"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus, LayoutGrid, List, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/publicar", label: "Publicar anuncio", icon: CirclePlus },
  { href: "/mis-anuncios", label: "Mis anuncios", icon: List },
  { href: "/mensajes", label: "Mensajes", icon: MessageCircle },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-background">
      <div className="flex flex-col gap-1 px-6 py-8">
        <span className="font-serif text-xl font-bold text-foreground">
          Bellezista
        </span>
        <span className="text-xs text-gold">El mundo de la belleza</span>
      </div>

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
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
