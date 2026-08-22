import Link from "next/link";
import { Pencil, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { iniciarConversacion } from "@/lib/actions/mensajes";
import { DestacarButton } from "@/components/anuncio/DestacarButton";
import { ComprarButton } from "@/components/anuncio/ComprarButton";

interface FichaContactoCardProps {
  anuncioId: string;
  propietarioNombre: string;
  loggedIn: boolean;
  esPropioAnuncio: boolean;
  // True while the listing is a paid featured one (for the owner's "renovar").
  destacado?: boolean;
  // Secure payment available: eligible type + seller has payouts activated.
  admitePagoSeguro?: boolean;
  precioFormateado?: string;
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
  destacado = false,
  admitePagoSeguro = false,
  precioFormateado = "",
  identidadOculta = false,
}: FichaContactoCardProps) {
  const nombreMostrado = identidadOculta
    ? "Anunciante confidencial"
    : propietarioNombre;

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6">
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
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Este es tu anuncio. Súbelo a premium para ganar posicionamiento y
            visibilidad.
          </p>
          <DestacarButton anuncioId={anuncioId} destacado={destacado} />
          <Button asChild variant="outline" className="w-full gap-2">
            <Link href={`/publicar/editar/${anuncioId}`}>
              <Pencil className="size-4" aria-hidden="true" />
              Editar anuncio
            </Link>
          </Button>
        </div>
      ) : !loggedIn ? (
        <div className="flex flex-col gap-3">
          {admitePagoSeguro && (
            <>
              <Button
                asChild
                size="lg"
                className="h-12 w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
              >
                <Link href={`/login?next=/anuncios/${anuncioId}`}>
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Comprar con pago seguro · {precioFormateado}
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Inicia sesión para comprar. El dinero queda retenido hasta que
                confirmas que todo está correcto.
              </p>
              <div className="my-1 border-t border-border" />
            </>
          )}
          <p className="text-sm text-muted-foreground">
            ¿Prefieres preguntar antes? Escribe al propietario. Inicia sesión para
            enviar tu mensaje.
          </p>
          <Button
            asChild
            size="lg"
            variant={admitePagoSeguro ? "outline" : "default"}
            className={
              admitePagoSeguro
                ? "h-12 w-full rounded-full"
                : "h-12 w-full rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
            }
          >
            <Link href={`/login?next=/anuncios/${anuncioId}`}>
              Enviar mensaje al propietario
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {admitePagoSeguro && (
            <>
              <ComprarButton
                anuncioId={anuncioId}
                precioFormateado={precioFormateado}
              />
              <div className="border-t border-border" />
            </>
          )}
          <form
            action={iniciarConversacion.bind(null, anuncioId)}
            className="flex flex-col gap-3"
          >
            <p className="text-sm text-muted-foreground">
              {admitePagoSeguro
                ? "¿Tienes dudas? Escribe al propietario antes de comprar."
                : "Escribe al propietario y pregúntale lo que necesites."}
            </p>
            <Button
              type="submit"
              size="lg"
              variant={admitePagoSeguro ? "outline" : "default"}
              className={
                admitePagoSeguro
                  ? "h-12 w-full rounded-full"
                  : "h-12 w-full rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
              }
            >
              Enviar mensaje al propietario
            </Button>
          </form>
        </div>
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
