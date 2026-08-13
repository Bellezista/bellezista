import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getCvById } from "@/lib/actions/talento";
import {
  estaDesbloqueado,
  getMiSaldoCreditos,
} from "@/lib/actions/talentoPagos";
import { confirmarSesionCheckout } from "@/lib/talento/otorgar";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DesbloquearCta } from "@/components/talento/DesbloquearCta";
import { labelTecnica } from "@/lib/talento/cv-tecnicas";
import {
  PUESTO_TALENTO_LABEL,
  JORNADA_TALENTO_LABEL,
  DISPONIBILIDAD_TALENTO_LABEL,
} from "@/lib/anuncio/labels";

export default async function CvDetallePage(props: PageProps<"/talento/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const cv = await getCvById(id);
  if (!cv || !cv.visible) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const esPropio = user?.id === cv.usuarioId;

  // Confirm the payment straight from the success redirect, so access is granted
  // even if the webhook hasn't landed yet (and works before it's configured).
  const sessionId = typeof sp?.session_id === "string" ? sp.session_id : null;
  if (user && !esPropio && sessionId) {
    await confirmarSesionCheckout(sessionId, user.id);
  }

  // Full profile + name + contact are gated behind the pay-to-access paywall.
  // The owner always sees their own CV; a business owner sees it once unlocked.
  const desbloqueado =
    esPropio || (user ? await estaDesbloqueado(user.id, cv.id) : false);
  const saldoCreditos = user && !esPropio ? await getMiSaldoCreditos() : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl bg-cream px-6 py-9 md:px-10 md:py-11">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          {PUESTO_TALENTO_LABEL[cv.puesto]}
        </span>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground md:text-4xl">
          {cv.aniosExperiencia} {cv.aniosExperiencia === 1 ? "año" : "años"} de
          experiencia
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {cv.provincia} · {JORNADA_TALENTO_LABEL[cv.jornada]} ·{" "}
          {DISPONIBILIDAD_TALENTO_LABEL[cv.disponibilidad]}
        </p>
      </div>

      {desbloqueado ? (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Candidato
            </p>
            <p className="text-lg font-semibold text-foreground">
              {cv.usuario.nombre}
            </p>
          </div>
          {cv.expectativaSalarial && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Expectativa salarial
              </p>
              <p className="text-sm text-foreground">
                {cv.expectativaSalarial}
              </p>
            </div>
          )}
          {cv.titulacion && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Titulación
              </p>
              <p className="text-sm text-foreground">{cv.titulacion}</p>
            </div>
          )}
          {cv.cursos && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Cursos y certificaciones
              </p>
              <p className="text-sm text-foreground">{cv.cursos}</p>
            </div>
          )}
          {cv.tecnicas.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Técnicas y aparatología
              </p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {cv.tecnicas.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground"
                  >
                    {labelTecnica(t.tecnica)}
                    {t.anios > 0 && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {t.anios} {t.anios === 1 ? "año" : "años"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cv.presentacion && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Presentación
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {cv.presentacion}
              </p>
            </div>
          )}
          {esPropio && (
            <Button asChild variant="outline">
              <Link href="/talento/mi-cv">Editar mi CV</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-lg text-foreground">
              Perfil confidencial
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Desbloquea este CV para ver el perfil completo, la formación y las
              técnicas del candidato.
            </p>
          </div>
          {sp?.pago === "cancel" && (
            <p className="text-sm text-muted-foreground">
              Has cancelado el pago. Puedes intentarlo de nuevo cuando quieras.
            </p>
          )}
          <DesbloquearCta
            cvId={cv.id}
            isAuthenticated={Boolean(user)}
            saldoCreditos={saldoCreditos}
          />
        </div>
      )}
    </div>
  );
}
