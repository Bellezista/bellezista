"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CirclePlus,
  LayoutGrid,
  List,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/publicar", label: "Publicar anuncio", icon: CirclePlus },
  { href: "/mis-anuncios", label: "Mis anuncios", icon: List },
  { href: "/mensajes", label: "Mensajes", icon: MessageCircle },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-30 bg-foreground/20 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-border bg-background transition-transform duration-200",
          open && "translate-x-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="flex items-center justify-between px-6 py-6">
          <span className="font-serif text-lg font-bold text-foreground">
            Bellezista
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
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
                onClick={() => setOpen(false)}
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
      </div>
    </div>
  );
}
