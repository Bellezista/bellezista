import { createClient } from "@/lib/supabase/server";
import { PortadaNav } from "@/components/home/PortadaNav";
import { Footer } from "@/components/layout/Footer";

// Marketplace chrome (black nav + footer) for all /talento pages.
export default async function TalentoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-white text-foreground">
      <PortadaNav loggedIn={Boolean(user)} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
