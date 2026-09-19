import Link from "next/link";
import { ShieldCheck, MessageSquare, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contacto · Bellezista" };

const PASOS = [
  {
    Icon: MessageSquare,
    titulo: "Escribe desde el anuncio",
    texto: 'Entra en el anuncio y pulsa "Enviar mensaje". Se abre una conversación privada con el propietario.',
  },
  {
    Icon: Lock,
    titulo: "Datos siempre protegidos",
    texto: "El teléfono y el correo no se muestran nunca. Todo el contacto ocurre dentro de la plataforma.",
  },
  {
    Icon: ShieldCheck,
    titulo: "Sigue la conversación",
    texto: "Continúas el chat desde tu sección de Mensajes, con total seguridad.",
  },
];

export default async function ContactoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#efe9df]">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
              Contacto
            </span>
            <h1 className="mt-3 font-serif text-[2.2rem] leading-tight text-foreground md:text-4xl">
              El contacto, siempre dentro de Bellezista
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Un modelo pensado para tu seguridad: hablas con el propietario sin
              exponer nunca tu teléfono ni tu correo.
            </p>
          </div>
        </section>

        {/* Pasos */}
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {PASOS.map(({ Icon, titulo, texto }) => (
              <div
                key={titulo}
                className="flex flex-col gap-3 rounded-xl border border-border bg-[#f6f2ea] p-6"
              >
                <Icon className="size-7 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="font-serif text-lg leading-snug text-foreground">
                  {titulo}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {texto}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="max-w-xl text-sm text-muted-foreground">
              ¿Aún no tienes una cuenta? Regístrate gratis para poder escribir a
              los anunciantes y guardar tus favoritos.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/traspasos"
                className="rounded-sm bg-[#171512] px-7 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black"
              >
                Explorar anuncios
              </Link>
              <Link
                href="/registro"
                className="rounded-sm border border-gold px-7 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-foreground"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
