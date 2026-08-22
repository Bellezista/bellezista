"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BadgeCheck, Check, Sparkles } from "lucide-react";

import { solicitarGestionProfesional } from "@/lib/actions/gestion";
import { Button } from "@/components/ui/button";

interface SolicitarGestorBannerProps {
  // Optional listing context: prefilled into the lead when requested from a
  // specific traspaso ficha. Omitted on the general Traspasos page banner.
  titulo?: string;
  precio?: number;
  provincia?: string;
  // "banner" = full-width promo (Traspasos page); "compact" = small card
  // (inside the ficha sidebar).
  variant?: "banner" | "compact";
}

// Lead-capture CTA for SoluciónOK's professional management service: the user
// asks a gestor de Bellezista to contact them and handle the sale of their
// business. Reuses solicitarGestionProfesional (same action as the publish-flow
// banner) but is self-contained -- no react-hook-form context -- so it can live
// on the Traspasos page and on any traspaso ficha.
export function SolicitarGestorBanner({
  titulo,
  precio,
  provincia,
  variant = "banner",
}: SolicitarGestorBannerProps) {
  const [pending, startTransition] = useTransition();
  const [enviado, setEnviado] = useState(false);
  const [noAuth, setNoAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function solicitar() {
    setError(null);
    setNoAuth(false);
    startTransition(async () => {
      const res = await solicitarGestionProfesional({ titulo, precio, provincia });
      if (res.error) {
        // The action returns this specific message for logged-out users.
        if (res.error.toLowerCase().includes("inicia sesión")) {
          setNoAuth(true);
        } else {
          setError(res.error);
        }
        return;
      }
      setEnviado(true);
    });
  }

  if (variant === "compact") {
    return (
      <div className="rounded-lg border border-gold/40 bg-gold/10 p-4">
        {enviado ? (
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-foreground">
              ¡Solicitud enviada! Un profesional de Bellezista te contactará para
              ayudarte con el traspaso.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground">
              ¿Prefieres que lo venda un profesional?
            </p>
            <p className="mb-3 mt-1 text-sm text-muted-foreground">
              Un gestor de Bellezista te contacta y se encarga de todo. Sin
              coste para ti.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={solicitar}
              className="w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
            >
              <BadgeCheck className="size-4" aria-hidden="true" />
              {pending ? "Enviando..." : "Que me contacte un profesional"}
            </Button>
            {noAuth && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <Link
                  href="/login?next=/traspasos"
                  className="text-foreground underline underline-offset-4"
                >
                  Inicia sesión
                </Link>{" "}
                para solicitar la ayuda.
              </p>
            )}
            {error && (
              <p className="mt-2 text-center text-xs text-destructive">{error}</p>
            )}
          </>
        )}
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-5">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-foreground">
          <Check className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-serif text-lg text-foreground">
            ¡Solicitud enviada!
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            Un profesional de Bellezista te contactará para ayudarte con tu
            traspaso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gold/40 bg-gold/10">
      <div className="flex flex-col md:flex-row">
        {/* Message zone */}
        <div className="flex-1 p-6 md:p-7">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Asesoría profesional
            </span>
          </div>
          <p className="mt-3 font-serif text-xl leading-tight text-foreground md:text-2xl">
            ¿Prefieres que un profesional se encargue de tu traspaso?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Un gestor de Bellezista te contacta y se encarga de todo —búsqueda de
            comprador, negociación y documentación—. Sin compromiso y sin coste
            para ti.
          </p>
        </div>

        {/* CTA zone */}
        <div className="flex flex-col justify-center gap-2 border-t border-gold/30 bg-gold/15 p-6 md:w-80 md:shrink-0 md:border-l md:border-t-0">
          <Button
            type="button"
            size="lg"
            disabled={pending}
            onClick={solicitar}
            className="h-12 w-full gap-2 rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            <BadgeCheck className="size-4" aria-hidden="true" />
            {pending ? "Enviando..." : "Que me contacte un profesional"}
          </Button>
          <p className="text-center text-xs text-foreground/70">
            Sin compromiso. Te contactamos nosotros.
          </p>
          {noAuth && (
            <p className="text-center text-xs text-foreground/70">
              <Link
                href="/login?next=/traspasos"
                className="text-foreground underline underline-offset-4"
              >
                Inicia sesión
              </Link>{" "}
              para solicitar la ayuda.
            </p>
          )}
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
