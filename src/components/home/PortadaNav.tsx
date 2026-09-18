"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";

const LINKS = [
  { href: "/traspasos", label: "Traspasos" },
  { href: "/catalogo", label: "Maquinaria" },
  { href: "/talento", label: "Empleo & Talento" },
  { href: "/profesionales", label: "Profesionales" },
  { href: "/actualidad", label: "Actualidad" },
];

// Black marketplace top nav for the portada (redesign brief). Auth-aware profile
// icon and a mobile menu.
export function PortadaNav({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const esActivo = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="bg-[#171512] text-white">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-5 px-6 md:px-8">
        <Link href="/" className="inline-block shrink-0 leading-none">
          <span
            className="block whitespace-nowrap text-[1.9rem] font-medium leading-none tracking-[0.14em]"
            style={{
              fontFamily: "var(--font-logo)",
              background: "linear-gradient(180deg,#dab86f 0%,#c19a52 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            BELLEZISTA
          </span>
          <span
            className="mt-1.5 hidden w-full text-[0.5rem] font-medium md:block"
            style={{
              color: "#c6a05a",
              textAlign: "justify",
              textAlignLast: "justify",
            }}
          >
            PLATAFORMA PROFESIONAL DE BELLEZA
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.08em] lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={esActivo(l.href) ? "page" : undefined}
              className={`whitespace-nowrap transition-colors ${
                esActivo(l.href)
                  ? "text-gold"
                  : "text-white/85 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/publicar"
            className="hidden whitespace-nowrap rounded-sm border border-gold px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-gold transition-colors hover:bg-gold hover:text-foreground sm:inline-block"
          >
            Publicar anuncio
          </Link>
          <Link
            href={loggedIn ? "/mis-anuncios" : "/login"}
            aria-label={loggedIn ? "Mi cuenta" : "Iniciar sesión"}
            className="text-white/85 transition-colors hover:text-white"
          >
            <User className="size-5" />
          </Link>
          <button
            type="button"
            aria-label="Menú"
            onClick={() => setOpen((v) => !v)}
            className="text-white/85 transition-colors hover:text-white lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-6 pb-4 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={esActivo(l.href) ? "page" : undefined}
              className={`block py-3 text-sm font-semibold uppercase tracking-[0.08em] ${
                esActivo(l.href) ? "text-gold" : "text-white/85"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/publicar"
            className="mt-2 block rounded-sm border border-gold px-4 py-2.5 text-center text-xs font-bold uppercase tracking-[0.1em] text-gold"
          >
            Publicar anuncio
          </Link>
        </nav>
      )}
    </header>
  );
}
