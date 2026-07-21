import type { AtributoDisplay } from "@/lib/anuncio/subtype-adapters";

interface FichaAtributosProps {
  atributos: AtributoDisplay[];
  descripcion?: string | null;
}

export function FichaAtributos({
  atributos,
  descripcion,
}: FichaAtributosProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {atributos.map((atributo) => (
          <div key={atributo.label} className="rounded-md bg-muted p-3">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {atributo.label}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {atributo.value}
            </p>
          </div>
        ))}
      </div>

      {descripcion && (
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-lg text-foreground">Descripción</h3>
          <p className="leading-relaxed text-foreground/90">{descripcion}</p>
        </div>
      )}
    </div>
  );
}
