"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function obtenerIniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted";

export function UserMenu({ userNombre }: { userNombre: string }) {
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Abrir menú de cuenta"
        >
          <span className="hidden sm:inline">{userNombre}</span>
          <Avatar>
            <AvatarFallback>{obtenerIniciales(userNombre)}</AvatarFallback>
          </Avatar>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-52 rounded-lg border border-border bg-background p-1 shadow-[var(--shadow-card)]"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">Sesión iniciada como</p>
            <p className="truncate text-sm font-medium text-foreground">
              {userNombre}
            </p>
          </div>

          <div className="p-1">
            <DropdownMenu.Item asChild>
              <Link href="/perfil" className={itemClass}>
                <UserRound className="size-4" aria-hidden="true" />
                Perfil
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={cn(itemClass, "text-destructive")}
              onSelect={cerrarSesion}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
