-- AlterEnum
ALTER TYPE "public"."TipoAnuncio" ADD VALUE 'TRASPASO';

-- CreateEnum
CREATE TYPE "public"."TipoNegocioTraspaso" AS ENUM ('CENTRO_ESTETICA', 'PELUQUERIA', 'BARBERIA', 'CLINICA_MEDICINA_ESTETICA', 'OTRAS_CLINICAS', 'SALON_MANICURA', 'SALON_MASAJES', 'SALON_BELLEZA', 'OTROS');

-- CreateEnum
CREATE TYPE "public"."TipoAnuncianteTraspaso" AS ENUM ('PARTICULAR', 'PROFESIONAL', 'INMOBILIARIA');

-- CreateTable
CREATE TABLE "public"."traspaso" (
    "anuncio_id" UUID NOT NULL,
    "tipo_negocio" "public"."TipoNegocioTraspaso" NOT NULL,
    "tipo_anunciante" "public"."TipoAnuncianteTraspaso" NOT NULL DEFAULT 'PARTICULAR',
    "descripcion" TEXT,
    "metros_cuadrados" INTEGER,
    "cabinas" INTEGER,
    "personal" INTEGER,
    "alquiler_mensual" DECIMAL(12,2),
    "incluye_licencia" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "traspaso_pkey" PRIMARY KEY ("anuncio_id")
);

-- CreateIndex
CREATE INDEX "traspaso_tipo_negocio_idx" ON "public"."traspaso"("tipo_negocio");

-- AddForeignKey
ALTER TABLE "public"."traspaso" ADD CONSTRAINT "traspaso_anuncio_id_fkey" FOREIGN KEY ("anuncio_id") REFERENCES "public"."anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS to match public.anuncio / public.maquinaria (locked to the anon
-- REST API; Prisma as table owner bypasses it). Not tracked by Prisma's
-- schema, kept here so a fresh `prisma migrate deploy` reproduces it.
ALTER TABLE "public"."traspaso" ENABLE ROW LEVEL SECURITY;
