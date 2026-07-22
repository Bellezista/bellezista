import { PrismaClient, TipoAnuncio, CategoriaMaquinaria, EstadoEquipo, NivelServicio } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Placeholder demo data for local development only -- whether real Maquinaria
// listings need migrating from the client's existing Bubble app (CSV export)
// is still unconfirmed per CLAUDE.md's pending-access list. This seed exists
// purely so `npm run dev` has something to look at before that's resolved.
//
// NOTE: this creates Usuario/Contacto rows directly, bypassing the
// auth.users -> usuario sync trigger (supabase/migrations/0003), because
// seeding real Supabase Auth users isn't something Prisma can do -- these
// seeded usuario ids are NOT valid Supabase Auth users, so you can browse the
// catalog with this data but can't log in as these seeded owners. Register a
// real account through the app to test the full flow end to end.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const propietario = await prisma.usuario.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      nombre: "Clínica Demo",
      contacto: {
        create: { email: "demo@bellezista.local", telefono: "+34 600 000 000" },
      },
    },
  });

  const listings = [
    {
      titulo: "Láser Diodo Triwave 3 Longitudes de Onda",
      precio: 8900,
      ciudadProvincia: "Barcelona",
      categoria: CategoriaMaquinaria.APARATOLOGIA,
      marca: "Cocoon",
      modelo: "Triwave 3",
      estadoEquipo: EstadoEquipo.COMO_NUEVO,
      descripcion:
        "Equipo de depilación láser triwave, mantenimiento al día, con carro de transporte y 2 mangos de repuesto.",
    },
    {
      titulo: "Radiofrecuencia Multipolar Indiba Style",
      precio: 4600,
      ciudadProvincia: "Madrid",
      categoria: CategoriaMaquinaria.APARATOLOGIA,
      marca: "Indiba",
      modelo: "Style",
      estadoEquipo: EstadoEquipo.BUEN_ESTADO,
      descripcion:
        "Radiofrecuencia multipolar para tratamientos faciales y corporales, incluye 4 cabezales originales.",
    },
    {
      titulo: "Hidrafacial Portátil 6 Pasos",
      precio: 2900,
      ciudadProvincia: "Valencia",
      categoria: CategoriaMaquinaria.EQUIPAMIENTO,
      marca: "Hydra Pro",
      modelo: "6 Pasos",
      estadoEquipo: EstadoEquipo.BUEN_ESTADO,
      descripcion:
        "Sistema de limpieza facial en 6 pasos, incluye kit de puntas y serums de reposición para 3 meses de uso.",
    },
  ];

  for (const listing of listings) {
    const { categoria, marca, modelo, estadoEquipo, descripcion, ...comunes } =
      listing;
    await prisma.anuncio.create({
      data: {
        tipo: TipoAnuncio.MAQUINARIA,
        ...comunes,
        fotos: [],
        propietarioId: propietario.id,
        maquinaria: {
          create: {
            categoria,
            marca,
            modelo,
            estadoEquipo,
            descripcion,
            nivelDeServicio: NivelServicio.BASICO,
          },
        },
      },
    });
  }

  console.log(`Seeded ${listings.length} Maquinaria listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
