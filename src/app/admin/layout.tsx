import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { RolUsuario } from "@generated/prisma/client";

// Real Prisma role check, not a JWT-claim guess -- proxy.ts only enforces
// "authenticated or not" (see the plan's Next.js 16 addendum on why the admin
// role check belongs close to the data, not in Proxy).
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/anuncios");

  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { rol: true },
  });
  if (usuario?.rol !== RolUsuario.ADMIN) redirect("/catalogo");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <p className="text-sm text-gold">Panel de administración</p>
        <nav className="mt-2 flex gap-6 text-sm">
          <Link
            href="/admin/anuncios"
            className="font-medium text-foreground hover:underline"
          >
            Anuncios
          </Link>
          <Link
            href="/admin/usuarios"
            className="font-medium text-foreground hover:underline"
          >
            Miembros
          </Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
