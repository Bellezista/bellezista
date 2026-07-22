import { listUsuariosAdmin } from "@/lib/actions/admin";
import { AdminUsuariosTable } from "@/components/admin/AdminUsuariosTable";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const usuarios = await listUsuariosAdmin();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Miembros
      </h1>
      <AdminUsuariosTable usuarios={usuarios} />
    </div>
  );
}
