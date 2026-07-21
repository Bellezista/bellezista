import { getConversaciones } from "@/lib/actions/mensajes";
import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "@/components/mensajes/InboxClient";

export const dynamic = "force-dynamic";

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const conversaciones = await getConversaciones();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Mensajes
      </h1>
      <InboxClient currentUserId={user!.id} initialData={conversaciones} />
    </div>
  );
}
