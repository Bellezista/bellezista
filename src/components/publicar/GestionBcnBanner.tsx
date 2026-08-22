"use client";

import { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { BadgeCheck, Check, Sparkles } from "lucide-react";

import { solicitarGestionProfesional } from "@/lib/actions/gestion";
import type { PublicarTraspasoFormInput } from "@/lib/validation/publicarTraspasoSchema";
import { Button } from "@/components/ui/button";

// Prominent promo block (client reference: Milanuncios PRO) offering Barcelona
// particulares SoluciónOK's free professional management, with a CTA that
// captures a lead. Rendered only when Barcelona + PARTICULAR (see StepDatosTraspaso).
export function GestionBcnBanner() {
  const { getValues } = useFormContext<PublicarTraspasoFormInput>();
  const [pending, startTransition] = useTransition();
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function solicitar() {
    setError(null);
    startTransition(async () => {
      const v = getValues();
      const precio =
        typeof v.precio === "number"
          ? v.precio
          : v.precio
            ? Number(v.precio)
            : undefined;
      const res = await solicitarGestionProfesional({
        titulo: v.titulo,
        precio,
        provincia: v.ciudadProvincia,
        seccion: "Traspasos",
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setEnviado(true);
    });
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
            Un experto de SoluciónOK te contactará para ayudarte a vender tu
            negocio. Mientras tanto, puedes terminar de publicar tu anuncio.
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
              Asesoría profesional gratuita · Barcelona
            </span>
          </div>
          <p className="mt-3 font-serif text-xl leading-tight text-foreground md:text-2xl">
            Deja que un experto venda tu negocio, sin coste para ti
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Nos encargamos de todo —búsqueda de comprador, negociación y
            documentación— y recibes íntegro el precio que pides por tu negocio:
            nuestros honorarios se añaden al precio que ve el comprador, no se
            descuentan de lo que tú recibes.
          </p>
        </div>

        {/* CTA zone */}
        <div className="flex flex-col justify-center gap-2 border-t border-gold/30 bg-gold/15 p-6 md:w-80 md:shrink-0 md:border-l md:border-t-0">
          <Button
            type="button"
            size="lg"
            disabled={pending}
            onClick={solicitar}
            className="h-12 w-full rounded-full bg-gold text-sm font-semibold text-foreground hover:bg-gold/90"
          >
            <BadgeCheck className="size-4" aria-hidden="true" />
            {pending ? "Enviando..." : "Solicitar ayuda profesional"}
          </Button>
          <p className="text-center text-xs text-foreground/70">
            Sin compromiso. Te contactamos nosotros.
          </p>
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
