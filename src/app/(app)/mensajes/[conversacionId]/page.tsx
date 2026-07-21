import { notFound } from "next/navigation";
import { getConversacion } from "@/lib/actions/mensajes";
import { createClient } from "@/lib/supabase/server";
import { ThreadClient } from "@/components/mensajes/ThreadClient";

export default async function ConversacionPage(
  props: PageProps<"/mensajes/[conversacionId]">,
) {
  const { conversacionId } = await props.params;
  const conversacion = await getConversacion(conversacionId);
  if (!conversacion) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ThreadClient
      conversacionId={conversacionId}
      currentUserId={user!.id}
      initialData={conversacion}
    />
  );
}
