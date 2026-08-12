import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getCvById } from "@/lib/actions/talento";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  PUESTO_TALENTO_LABEL,
  JORNADA_TALENTO_LABEL,
  DISPONIBILIDAD_TALENTO_LABEL,
} from "@/lib/anuncio/labels";

export default async function CvDetallePage(props: PageProps<"/talento/[id]">) {
  const { id } = await props.params;
  const cv = await getCvById(id);
  if (!cv || !cv.visible) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const esPropio = user?.id === cv.usuarioId;

  // Full profile + name + contact are gated behind the pay-to-access paywall.
  // The owner always sees their own CV. Everyone else sees the teaser + the
  // unlock prompt (the actual payment lands with Stripe).
  const desbloqueado = esPropio;

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
          {cv.formacion && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Formación
              </p>
              <p className="text-sm text-foreground">{cv.formacion}</p>
            </div>
          )}
          {cv.habilidades && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Habilidades
              </p>
              <p className="text-sm text-foreground">{cv.habilidades}</p>
            </div>
          )}
          {cv.presentacion && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Sobre mí
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
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-lg text-foreground">
              Perfil confidencial
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Desbloquea este CV para ver el perfil completo, la formación y
              contactar con el candidato.
            </p>
          </div>
          <Button disabled>Desbloquear (próximamente)</Button>
          <p className="text-xs text-muted-foreground">
            El acceso de pago a los CVs estará disponible muy pronto.
          </p>
        </div>
      )}
    </div>
  );
}
