import Link from "next/link";

const HERO_IMG =
  "https://tcskwxcxfklukekmhttl.supabase.co/storage/v1/object/public/fotos-video/site/hero-talento2.jpg";

const wordmarkStyle = {
  fontFamily: "var(--font-logo)",
  background: "linear-gradient(180deg,#dab86f 0%,#c19a52 100%)",
  WebkitBackgroundClip: "text" as const,
  backgroundClip: "text" as const,
  color: "transparent",
};

function Wordmark({ size = "1.9rem" }: { size?: string }) {
  return (
    <span className="text-center leading-none">
      <span
        className="block whitespace-nowrap font-medium leading-none tracking-[0.14em]"
        style={{ ...wordmarkStyle, fontSize: size }}
      >
        BELLEZISTA
      </span>
      <span
        className="mt-1.5 block whitespace-nowrap text-[0.5rem] font-medium"
        style={{
          color: "#c6a05a",
          textAlign: "justify",
          textAlignLast: "justify",
        }}
      >
        PLATAFORMA PROFESIONAL DE BELLEZA
      </span>
    </span>
  );
}

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      {/* Left half: beauty banner. Hidden on small screens. */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src={HERO_IMG}
          alt="Recepción de un centro de belleza"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171512]/85 via-[#171512]/30 to-[#171512]/45" />
        <div className="absolute left-0 top-0 p-10">
          <Link href="/" aria-label="Ir al inicio" className="inline-block">
            <Wordmark size="1.6rem" />
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="max-w-sm font-serif text-3xl leading-tight text-white">
            El punto de encuentro del sector de la belleza
          </p>
        </div>
      </div>

      {/* Right half: the auth form. */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" aria-label="Ir al inicio">
              <Wordmark />
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(20,19,16,.04),0_12px_28px_rgba(20,19,16,.09)]">
            <div className="h-1.5 bg-gold" aria-hidden="true" />
            <div className="p-6 md:p-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
