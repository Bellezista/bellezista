import { createClient } from "@/lib/supabase/server";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quiénes somos · Bellezista" };

export default async function QuienesSomosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-28 text-center">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-gold">
          Quiénes somos
        </span>
        <h1 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
          El punto de encuentro del sector de la belleza
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Bellezista conecta a profesionales, negocios y proveedores del sector
          beauty en España. Muy pronto contaremos aquí nuestra historia y nuestro
          propósito.
        </p>
      </main>
      <Footer />
    </div>
  );
}
