import { getConversaciones } from "@/lib/actions/mensajes";
import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "@/components/mensajes/InboxClient";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const conversaciones = await getConversaciones();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Mensajería"
        title="Mensajes"
        subtitle="Tus conversaciones con interesados y propietarios."
      />
      <InboxClient currentUserId={user!.id} initialData={conversaciones} />
    </div>
  );
}
