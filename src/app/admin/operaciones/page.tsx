import { listOperacionesAdmin } from "@/lib/actions/admin";
import { formatPrecio } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ESTADO_OPERACION_LABEL,
  ESTADO_OPERACION_TONO,
  type TonoEstado,
} from "@/lib/operacion/labels";
import { ResolverOperacion } from "@/components/admin/ResolverOperacion";

export const dynamic = "force-dynamic";

const TONO_CLASE: Record<TonoEstado, string> = {
  neutro: "bg-muted text-muted-foreground",
  activo: "bg-gold/15 text-foreground",
  exito: "bg-emerald-100 text-emerald-800",
  alerta: "bg-red-100 text-red-800",
};

export default async function AdminOperacionesPage() {
  const operaciones = await listOperacionesAdmin();

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-foreground">
        Operaciones con pago seguro
      </h1>
      <p className="text-sm text-muted-foreground">
        Pagos retenidos e incidencias. Puedes liberar el pago al vendedor o
        reembolsar al comprador cuando el pago está en revisión o hay una
        incidencia.
      </p>

      {operaciones.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          No hay operaciones todavía.
        </p>
      ) : (
        <div className="space-y-3">
          {operaciones.map((op) => {
            const puedeResolver =
              op.estadoOperacion === "PAGADO_EN_REVISION" ||
              op.estadoOperacion === "INCIDENCIA_ABIERTA";
            return (
              <div
                key={op.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {op.anuncio?.titulo ?? "Anuncio eliminado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {op.comprador?.nombre ?? "?"} compra a{" "}
                    {op.propietario?.nombre ?? "?"}
                    {op.precioFinal ? ` · ${formatPrecio(op.precioFinal.toString())}` : ""}
                    {op.comision ? ` · comisión ${formatPrecio(op.comision.toString())}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        TONO_CLASE[ESTADO_OPERACION_TONO[op.estadoOperacion]],
                      )}
                    >
                      {ESTADO_OPERACION_LABEL[op.estadoOperacion]}
                    </span>
                    {!op.propietario?.cobrosActivos && puedeResolver && (
                      <span className="text-xs text-red-700">
                        El vendedor no tiene cobros activados
                      </span>
                    )}
                  </div>
                  {op.motivoIncidencia && (
                    <p className="mt-1 text-sm text-red-800">
                      Incidencia: {op.motivoIncidencia}
                    </p>
                  )}
                </div>
                {puedeResolver && <ResolverOperacion operacionId={op.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
