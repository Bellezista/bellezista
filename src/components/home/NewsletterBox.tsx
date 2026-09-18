"use client";

import { useState } from "react";

export function NewsletterBox({ vertical = false }: { vertical?: boolean }) {
  const [enviado, setEnviado] = useState(false);
  const [email, setEmail] = useState("");

  if (vertical) {
    return (
      <div className="relative flex h-full flex-col justify-center overflow-hidden bg-[#171512] p-10 text-white md:p-12">
        {/* Decorative watermark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 -right-2 select-none font-serif text-[11rem] leading-none text-white/[0.04]"
        >
          B
        </span>

        <div className="relative">
          <span className="text-[0.7rem] font-semibold uppercase leading-relaxed tracking-[0.22em] text-gold">
            Sé parte de la comunidad Bellezista
          </span>
          <p className="mt-5 max-w-[36ch] text-sm leading-relaxed text-white/70">
            Recibe cada semana noticias, tendencias y oportunidades exclusivas.
          </p>
          {enviado ? (
            <p className="mt-6 rounded-lg bg-white/10 px-5 py-4 text-sm text-white">
              ¡Gracias! Te avisaremos de las novedades.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setEnviado(true);
              }}
              className="mt-7 flex flex-col gap-3.5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                className="w-full rounded-sm border border-transparent bg-white px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-gold focus:bg-gold/5 focus:ring-2 focus:ring-gold/40"
              />
              <button
                type="submit"
                className="w-full rounded-sm bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-gold/90"
              >
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 rounded-2xl bg-[#171512] p-10 text-white md:grid-cols-[1.3fr_1fr] md:items-center md:p-12">
      <div>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold">
          Sé parte de la comunidad
        </span>
        <h3 className="mt-3 font-serif text-2xl md:text-3xl">
          Novedades del sector, cada semana
        </h3>
        <p className="mt-2 max-w-[42ch] text-sm text-white/65">
          Recibe noticias, tendencias y oportunidades exclusivas de Bellezista en
          tu correo.
        </p>
      </div>
      {enviado ? (
        <p className="rounded-lg bg-white/10 px-5 py-4 text-sm text-white">
          ¡Gracias! Te avisaremos de las novedades.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) setEnviado(true);
          }}
          className="flex gap-2.5"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            className="min-w-0 flex-1 rounded-sm px-4 py-3.5 text-sm text-foreground outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-sm bg-gold px-6 text-xs font-bold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-gold/90"
          >
            Suscribirme
          </button>
        </form>
      )}
    </div>
  );
}
