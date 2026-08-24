import Link from "next/link";

export const metadata = {
  title: "Política de cookies · Bellezista",
};

// Basic cookie policy page linked from the cookie banner. The legal wording is a
// starting point; the client should review/finalize it with their asesoría.
export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm font-bold text-foreground"
      >
        Bellez<span className="text-gold">i</span>sta
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-foreground">
        Política de cookies
      </h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          En Bellezista utilizamos cookies propias y de terceros para asegurar el
          correcto funcionamiento del sitio, recordar tus preferencias y mejorar
          tu experiencia de navegación.
        </p>

        <h2 className="pt-2 font-serif text-xl text-foreground">
          ¿Qué es una cookie?
        </h2>
        <p>
          Una cookie es un pequeño archivo de texto que un sitio web guarda en tu
          navegador. Sirve para que la web recuerde información sobre tu visita.
        </p>

        <h2 className="pt-2 font-serif text-xl text-foreground">
          Tipos de cookies que usamos
        </h2>
        <p>
          <strong className="text-foreground">Técnicas o necesarias:</strong>{" "}
          imprescindibles para el funcionamiento del sitio (sesión, seguridad,
          preferencias básicas).
        </p>
        <p>
          <strong className="text-foreground">De preferencias:</strong> recuerdan
          opciones que eliges, como el aviso de cookies ya aceptado.
        </p>
        <p>
          <strong className="text-foreground">
            Analíticas y de terceros:
          </strong>{" "}
          nos ayudan a entender cómo se usa el sitio para mejorarlo. Solo se
          activan si las aceptas.
        </p>

        <h2 className="pt-2 font-serif text-xl text-foreground">
          Gestión de cookies
        </h2>
        <p>
          Puedes aceptar o rechazar las cookies desde el aviso que aparece al
          entrar. También puedes borrar o bloquear las cookies desde la
          configuración de tu navegador en cualquier momento.
        </p>

        <p className="pt-4 text-xs">
          Para cualquier duda sobre esta política, puedes escribirnos a
          info@bellezista.com.
        </p>
      </div>
    </main>
  );
}
