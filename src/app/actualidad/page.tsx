import { createClient } from "@/lib/supabase/server";
import { getResumenDiario } from "@/lib/home/resumen";
import { getProximosEventos } from "@/lib/actions/eventos";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Actualidad · Bellezista" };

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export default async function ActualidadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [resumen, eventos] = await Promise.all([
    getResumenDiario(),
    getProximosEventos(6),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-gold">
          Actualidad Bellezista
        </span>
        <h1 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
          Todo lo que pasa cada día en el sector de la belleza
        </h1>

        <div className="mt-10 rounded-2xl bg-[#171512] p-8 text-white md:p-10">
          <h2 className="font-serif text-2xl text-white">Hoy en el sector</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {resumen.map((l, i) => (
              <li key={i} className="flex items-start gap-3.5 text-[0.98rem] text-white/90">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-gold" />
                <span>
                  <b className="font-semibold text-white">{l.destacado}</b>
                  {l.texto}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {eventos.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl">Próximos eventos</h2>
            <div className="mt-6 flex flex-col gap-4">
              {eventos.map((ev) => {
                const f = new Date(ev.fecha);
                return (
                  <div key={ev.id} className="border-b border-border pb-4 last:border-b-0">
                    <p className="text-sm text-gold">
                      {f.getDate()} {MESES[f.getMonth()]} {f.getFullYear()}
                    </p>
                    <p className="font-semibold">{ev.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {[ev.ciudad, ev.modalidad].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
