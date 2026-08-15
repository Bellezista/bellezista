import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { iniciarConversacion } from "@/lib/actions/mensajes";

interface FichaContactoCardProps {
  anuncioId: string;
  propietarioNombre: string;
  loggedIn: boolean;
  esPropioAnuncio: boolean;
  // Traspaso confidentiality: hide the owner's name/initials until the
  // interested party has contacted (see the ficha page).
  identidadOculta?: boolean;
}

function obtenerIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return (partes[0]!.charAt(0) + partes[partes.length - 1]!.charAt(0)).toUpperCase();
}

export function FichaContactoCard({
  anuncioId,
  propietarioNombre,
  loggedIn,
  esPropioAnuncio,
  identidadOculta = false,
}: FichaContactoCardProps) {
  const nombreMostrado = identidadOculta
    ? "Anunciante confidencial"
    : propietarioNombre;

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 lg:sticky lg:top-8">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Contacto
      </span>

      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>
            {identidadOculta ? "?" : obtenerIniciales(propietarioNombre)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {nombreMostrado}
          </p>
          <p className="text-xs text-muted-foreground">
            {identidadOculta ? "Datos confidenciales" : "Propietario"}
          </p>
        </div>
      </div>

      {esPropioAnuncio ? (
        <p className="text-sm text-muted-foreground">Este es tu anuncio.</p>
      ) : !loggedIn ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Escribe al propietario y pregúntale lo que necesites. Inicia sesión
            para enviar tu mensaje.
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            <Link href={`/login?next=/anuncios/${anuncioId}`}>
              Enviar mensaje al propietario
            </Link>
          </Button>
        </div>
      ) : (
        <form
          action={iniciarConversacion.bind(null, anuncioId)}
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-muted-foreground">
            Escribe al propietario y pregúntale lo que necesites.
          </p>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            Enviar mensaje al propietario
          </Button>
        </form>
      )}

      {!esPropioAnuncio && (
        <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          {identidadOculta
            ? "Este traspaso es confidencial. El nombre y la ubicación exacta del negocio se muestran cuando contactas. El teléfono y el correo nunca se comparten."
            : "Por privacidad, el teléfono y el correo no se muestran. Hablaréis dentro de Bellezista y la conversación quedará en tu sección de Mensajes."}
        </p>
      )}
    </div>
  );
}
