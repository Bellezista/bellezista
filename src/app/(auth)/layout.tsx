import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
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
  );
}
