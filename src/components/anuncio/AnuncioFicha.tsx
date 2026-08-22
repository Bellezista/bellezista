import type { Anuncio, Maquinaria, Traspaso } from "@generated/prisma/client";
import {
  atributosFichaDe,
  categoriaLabelDe,
  descripcionDe,
} from "@/lib/anuncio/subtype-adapters";
import { formatPrecio } from "@/lib/format";
import { FichaGaleria } from "@/components/anuncio/FichaGaleria";
import { FichaAtributos } from "@/components/anuncio/FichaAtributos";
import { FichaContactoCard } from "@/components/anuncio/FichaContactoCard";
import { AlertaSimilaresButton } from "@/components/alertas/AlertaSimilaresButton";
import { EstadoTexto } from "@/components/anuncio/EstadoTexto";

interface AnuncioFichaProps {
  anuncio: Anuncio & {
    maquinaria: Maquinaria | null;
    traspaso: Traspaso | null;
    propietario: { nombre: string };
  };
  loggedIn: boolean;
  currentUserId?: string;
  // Traspaso confidentiality tier: `confidencial` shows the badge + hides the
  // exact zone; `identidadOculta` also hides the owner's name until contact.
  confidencial?: boolean;
  identidadOculta?: boolean;
}

// Composes the ficha sub-components from the "ficha" fan-out group. This is
// the only place that knows how they fit together -- each sub-component
// stays ignorant of the others, same reusable-component pattern as the rest
// of the app (see src/lib/anuncio/subtype-adapters.ts).
export function AnuncioFicha({
  anuncio,
  loggedIn,
  currentUserId,
  confidencial = false,
  identidadOculta = false,
}: AnuncioFichaProps) {
  const atributos = atributosFichaDe(anuncio);
  const descripcion = descripcionDe(anuncio);
  const categoria = categoriaLabelDe(anuncio);
  const esPropioAnuncio = currentUserId === anuncio.propietarioId;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <FichaGaleria
          fotos={anuncio.fotos}
          titulo={anuncio.titulo}
          confidencial={confidencial}
        />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            {categoria && (
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
                {categoria}
              </span>
            )}
            <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground md:text-4xl">
              {anuncio.titulo}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {anuncio.ciudadProvincia}
                {confidencial && " · zona a confirmar"}
              </span>
              {anuncio.estado !== "ACTIVO" && (
                <>
                  <span aria-hidden="true" className="text-border">
                    &middot;
                  </span>
                  <EstadoTexto estado={anuncio.estado} />
                </>
              )}
            </div>
          </div>
          <p className="font-serif text-3xl text-gold">
            {formatPrecio(anuncio.precio.toString())}
          </p>
        </div>

        <div className="mt-6">
          <FichaAtributos atributos={atributos} descripcion={descripcion} />
        </div>
      </div>

      {/* Grid item stretches to the row height by default, giving the inner
          wrapper room to stick as the (taller) left column scrolls. */}
      <div>
        <div className="space-y-4 lg:sticky lg:top-8">
          <FichaContactoCard
            anuncioId={anuncio.id}
            propietarioNombre={anuncio.propietario.nombre}
            loggedIn={loggedIn}
            esPropioAnuncio={esPropioAnuncio}
            identidadOculta={identidadOculta}
          />

          {anuncio.tipo === "TRASPASO" && anuncio.traspaso && (
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-foreground">
                ¿Buscas negocios como este?
              </p>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Crea una alerta y te avisamos por email cuando se publiquen
                traspasos similares
                {categoria ? ` de ${categoria.toLowerCase()}` : ""}.
              </p>
              <AlertaSimilaresButton
                seccion="TRASPASOS"
                filtros={{ tipoNegocio: anuncio.traspaso.tipoNegocio }}
                etiqueta="Crear alerta de negocios similares"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
