import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMisVentas } from "@/lib/actions/operacion";
import { getEstadoCobros } from "@/lib/actions/connect";
import { formatPrecio } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ESTADO_OPERACION_LABEL,
  ESTADO_OPERACION_TONO,
  type TonoEstado,
} from "@/lib/operacion/labels";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

const TONO_CLASE: Record<TonoEstado, string> = {
  neutro: "bg-muted text-muted-foreground",
  activo: "bg-gold/15 text-foreground",
  exito: "bg-emerald-100 text-emerald-800",
  alerta: "bg-red-100 text-red-800",
};

export default async function MisVentasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mis-ventas");

  const [ventas, estadoCobros] = await Promise.all([
    getMisVentas(),
    getEstadoCobros(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Mi cuenta"
        title="Mis ventas"
        subtitle="Las ventas con pago seguro de tus anuncios y el estado de cada cobro."
      />

      {!estadoCobros?.cobrosActivos && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm text-foreground">
          Para vender con pago seguro, activa primero tus cobros desde{" "}
          <Link href="/perfil" className="font-semibold underline underline-offset-4">
            tu perfil
          </Link>
          .
        </div>
      )}

      {ventas.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no tienes ventas con pago seguro.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ventas.map((v) => {
            const foto = v.anuncio?.fotos[0];
            const bruto = v.precioFinal ? Number(v.precioFinal) : 0;
            const comision = v.comision ? Number(v.comision) : 0;
            const neto = bruto - comision;
            return (
              <div
                key={v.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {foto ? (
                    <Image src={foto} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <ImageOff className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {v.anuncio ? (
                    <Link
                      href={`/anuncios/${v.anuncio.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {v.anuncio.titulo}
                    </Link>
                  ) : (
                    <p className="font-medium text-muted-foreground">
                      Anuncio no disponible
                    </p>
                  )}
                  <div className="mt-1">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        TONO_CLASE[ESTADO_OPERACION_TONO[v.estadoOperacion]],
                      )}
                    >
                      {ESTADO_OPERACION_LABEL[v.estadoOperacion]}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm sm:w-40">
                  <p className="text-muted-foreground">
                    Precio {formatPrecio(bruto.toString())}
                  </p>
                  <p className="text-muted-foreground">
                    Comisión -{formatPrecio(comision.toString())}
                  </p>
                  <p className="font-semibold text-foreground">
                    Recibes {formatPrecio(neto.toString())}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
