import type { MisAnuncioSerializado } from "@/types/anuncio";

interface PanelStatsRowProps {
  anuncios: MisAnuncioSerializado[];
}

interface Stat {
  label: string;
  value: number;
}

// Plain, flat, monochrome stat blocks -- no colored KPI cards, no icon
// backgrounds/gradients. See CLAUDE.md "Visual direction": no colored
// badges/pills, thin hairline borders, generous whitespace.
export function PanelStatsRow({ anuncios }: PanelStatsRowProps) {
  const total = anuncios.length;
  const activos = anuncios.filter((a) => a.estado === "ACTIVO").length;
  const vistas = anuncios.reduce((sum, a) => sum + a.vistas, 0);
  const mensajes = anuncios.reduce(
    (sum, a) => sum + a._count.conversaciones,
    0,
  );

  const stats: Stat[] = [
    { label: "Anuncios publicados", value: total },
    { label: "Anuncios activos", value: activos },
    { label: "Vistas totales", value: vistas },
    { label: "Contactos recibidos", value: mensajes },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg bg-cream p-4">
          <p className="font-serif text-3xl text-foreground">
            {stat.value.toLocaleString("es-ES")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
