import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { contarAnunciosActivos } from "@/lib/actions/anuncios";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

// Same shell as (app)/layout.tsx, but no auth redirect -- /catalogo and
// /anuncios/[id] are public (see proxy.ts). Shows a "Iniciar sesión" link
// in the topbar instead of the user's name when logged out.
export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const usuario = user
    ? await prisma.usuario.findUnique({
        where: { id: user.id },
        select: { nombre: true },
      })
    : null;

  const isAuthenticated = !!user;
  const anunciosActivos = await contarAnunciosActivos();

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        isAuthenticated={isAuthenticated}
        anunciosActivos={anunciosActivos}
      />
      <div className="flex flex-1 flex-col">
        <AppTopbar
          userNombre={usuario?.nombre ?? user?.email ?? null}
          mobileNav={<MobileNav isAuthenticated={isAuthenticated} />}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
