import { listProveedoresAdmin } from "@/lib/actions/proveedores";
import {
  ProveedoresAdmin,
  type ProveedorView,
} from "@/components/admin/ProveedoresAdmin";

export const dynamic = "force-dynamic";

export default async function AdminProveedoresPage() {
  const proveedores = await listProveedoresAdmin();
  const vista: ProveedorView[] = proveedores.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    zonaCobertura: p.zonaCobertura,
    premium: p.premium,
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-foreground">
        Profesionales (directorio)
      </h1>
      <p className="text-sm text-muted-foreground">
        Estos profesionales aparecen en la página Profesionales. Marca "Premium"
        para destacarlos con badge y ordenarlos primero.
      </p>
      <ProveedoresAdmin proveedores={vista} />
    </div>
  );
}
