import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Contacto | Bellezista",
};

// Minimal contact page so the footer "Contacto" link has a real, on-brand
// destination. It explains Bellezista's privacy-first contact model (all
// contact runs through each listing's messaging, phone/email never shown)
// rather than inventing a support email. Swap in a real email/WhatsApp here
// if the client wants a direct channel.
export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="rounded-xl bg-cream px-6 py-9 md:px-10 md:py-11">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          Contacto
        </span>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground md:text-4xl">
          ¿Cómo contactar?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Todo el contacto sucede dentro de Bellezista, de forma segura.
        </p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Para preguntar por un equipo, entra en su anuncio y pulsa{" "}
          <span className="text-foreground">Enviar mensaje</span>. Se abre una
          conversación privada con el propietario y la sigues desde tu sección
          de Mensajes.
        </p>
        <p>
          Por privacidad, el teléfono y el correo no se muestran en ningún
          momento. Así, el interesado y el propietario hablan siempre dentro de
          la plataforma y los datos de contacto nunca quedan expuestos.
        </p>
      </div>

      <Button asChild variant="default">
        <Link href="/catalogo">Ver el catálogo</Link>
      </Button>
    </div>
  );
}
