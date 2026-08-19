import { after } from "next/server";
import Link from "next/link";
import {
  getMisNotificaciones,
  marcarNotificacionesLeidas,
} from "@/lib/actions/notificaciones";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function NotificacionesPage() {
  const notificaciones = await getMisNotificaciones();
  // Mark them read after the response, so the badge clears on next poll.
  after(() => marcarNotificacionesLeidas().catch(() => {}));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Tu cuenta" title="Notificaciones" />

      {notificaciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tienes notificaciones.
        </p>
      ) : (
        <ul className="space-y-2">
          {notificaciones.map((n) => (
            <li key={n.id}>
              <Link
                href={n.url ?? "/notificaciones"}
                className={`block rounded-lg border p-4 transition-colors hover:bg-muted ${
                  n.leida ? "border-border" : "border-gold/40 bg-gold/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {n.titulo}
                    </p>
                    {n.cuerpo && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {n.cuerpo}
                      </p>
                    )}
                  </div>
                  {!n.leida && (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-gold"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(n.creadoEn).toLocaleString("es-ES")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
