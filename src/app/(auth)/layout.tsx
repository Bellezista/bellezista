import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const HERO_IMG =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site/hero.png";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      {/* Left half: the home banner image. Hidden on small screens so the form
          stays full-width and usable on mobile. */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src={HERO_IMG}
          alt="Recepción de un centro de belleza"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#262420]/80 via-[#262420]/30 to-[#262420]/20" />
        <div className="absolute left-0 top-0 p-10">
          <Link href="/" aria-label="Ir al inicio">
            <Logo className="text-2xl text-background" />
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-serif text-3xl italic leading-tight text-background">
            Tu próxima oportunidad empieza aquí
          </p>
        </div>
      </div>

      {/* Right half: the auth form. */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1>
              <Link href="/" aria-label="Ir al inicio">
                <Logo className="text-2xl" />
              </Link>
            </h1>
            <p className="mt-1 text-sm text-gold">
              El mundo de la belleza, en un solo lugar
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="h-1.5 bg-gold" aria-hidden="true" />
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
