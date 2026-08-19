"use client";

import { useState } from "react";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMisNotificaciones,
  getConteoNotificaciones,
  marcarNotificacionesLeidas,
} from "@/lib/actions/notificaciones";

export function NotificacionesBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: conteo } = useQuery({
    queryKey: ["conteo-notificaciones"],
    queryFn: () => getConteoNotificaciones(),
    refetchInterval: 20_000,
  });

  const { data: lista } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: () => getMisNotificaciones(),
    enabled: open,
  });

  const noLeidas = conteo ?? 0;

  async function onOpenChange(next: boolean) {
    setOpen(next);
    if (next && noLeidas > 0) {
      await marcarNotificacionesLeidas();
      qc.setQueryData(["conteo-notificaciones"], 0);
    }
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex size-9 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-5" aria-hidden="true" />
          {noLeidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-4 text-foreground">
              {noLeidas > 9 ? "9+" : noLeidas}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 overflow-hidden rounded-lg border border-border bg-background shadow-[var(--shadow-card)]"
        >
          <div className="border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold text-foreground">
              Notificaciones
            </p>
          </div>

          {!lista || lista.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No tienes notificaciones.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {lista.slice(0, 8).map((n) => (
                <DropdownMenu.Item asChild key={n.id}>
                  <Link
                    href={n.url ?? "/notificaciones"}
                    className="block px-4 py-2.5 outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {n.titulo}
                    </p>
                    {n.cuerpo && (
                      <p className="truncate text-xs text-muted-foreground">
                        {n.cuerpo}
                      </p>
                    )}
                  </Link>
                </DropdownMenu.Item>
              ))}
            </div>
          )}

          <DropdownMenu.Item asChild>
            <Link
              href="/notificaciones"
              className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-gold outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted"
            >
              Ver todas
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
