import type { Anuncio, Maquinaria } from "@generated/prisma/client";
import { maquinariaAdapter } from "@/lib/anuncio/subtype-adapters";
import { formatPrecio } from "@/lib/format";
import { FichaGaleria } from "@/components/anuncio/FichaGaleria";
import { FichaAtributos } from "@/components/anuncio/FichaAtributos";
import { FichaContactoCard } from "@/components/anuncio/FichaContactoCard";
import { EstadoTexto } from "@/components/anuncio/EstadoTexto";

interface AnuncioFichaProps {
  anuncio: Anuncio & {
    maquinaria: Maquinaria | null;
    propietario: { nombre: string };
  };
  loggedIn: boolean;
  currentUserId?: string;
}

// Composes the ficha sub-components from the "ficha" fan-out group. This is
// the only place that knows how they fit together -- each sub-component
// stays ignorant of the others, same reusable-component pattern as the rest
// of the app (see src/lib/anuncio/subtype-adapters.ts).
export function AnuncioFicha({
  anuncio,
  loggedIn,
  currentUserId,
}: AnuncioFichaProps) {
  if (!anuncio.maquinaria) return null;

  const atributos = maquinariaAdapter.getAtributosFicha(anuncio.maquinaria);
  const descripcion = maquinariaAdapter.getDescripcion(anuncio.maquinaria);
  const esPropioAnuncio = currentUserId === anuncio.propietarioId;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <FichaGaleria fotos={anuncio.fotos} titulo={anuncio.titulo} />

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {anuncio.titulo}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {anuncio.ciudadProvincia}
            </p>
            <EstadoTexto estado={anuncio.estado} />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatPrecio(anuncio.precio.toString())}
          </p>
        </div>

        <div className="mt-6">
          <FichaAtributos atributos={atributos} descripcion={descripcion} />
        </div>
      </div>

      <div>
        <FichaContactoCard
          anuncioId={anuncio.id}
          propietarioNombre={anuncio.propietario.nombre}
          loggedIn={loggedIn}
          esPropioAnuncio={esPropioAnuncio}
        />
      </div>
    </div>
  );
}
