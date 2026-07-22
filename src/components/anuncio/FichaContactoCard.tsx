import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { iniciarConversacion } from "@/lib/actions/mensajes";

interface FichaContactoCardProps {
  anuncioId: string;
  propietarioNombre: string;
  loggedIn: boolean;
  esPropioAnuncio: boolean;
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
}: FichaContactoCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>{obtenerIniciales(propietarioNombre)}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-semibold text-foreground">
          {propietarioNombre}
        </p>
      </div>

      {esPropioAnuncio ? (
        <p className="text-sm text-muted-foreground">Este es tu anuncio.</p>
      ) : !loggedIn ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Inicia sesión para contactar al propietario.
          </p>
          <Button asChild variant="default" className="w-full">
            <Link href={`/login?next=/anuncios/${anuncioId}`}>
              Iniciar sesión
            </Link>
          </Button>
        </div>
      ) : (
        <form action={iniciarConversacion.bind(null, anuncioId)}>
          <Button type="submit" variant="default" className="w-full">
            Enviar mensaje
          </Button>
        </form>
      )}
    </div>
  );
}
