-- CreateEnum
CREATE TYPE "public"."PuestoTalento" AS ENUM ('ESTETICISTA', 'PELUQUERO', 'BARBERO', 'MANICURISTA', 'MAQUILLADOR', 'MASAJISTA', 'RECEPCIONISTA', 'OTROS');

-- CreateEnum
CREATE TYPE "public"."JornadaTalento" AS ENUM ('COMPLETA', 'PARCIAL', 'INDIFERENTE');

-- CreateEnum
CREATE TYPE "public"."DisponibilidadTalento" AS ENUM ('INMEDIATA', 'EN_DOS_SEMANAS', 'EN_UN_MES', 'A_CONVENIR');

-- CreateTable
CREATE TABLE "public"."cv" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "puesto" "public"."PuestoTalento" NOT NULL,
    "provincia" TEXT NOT NULL,
    "anios_experiencia" INTEGER NOT NULL,
    "jornada" "public"."JornadaTalento" NOT NULL DEFAULT 'INDIFERENTE',
    "disponibilidad" "public"."DisponibilidadTalento" NOT NULL DEFAULT 'A_CONVENIR',
    "formacion" TEXT,
    "habilidades" TEXT,
    "presentacion" TEXT,
    "foto" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cv_usuario_id_key" ON "public"."cv"("usuario_id");

-- CreateIndex
CREATE INDEX "cv_puesto_idx" ON "public"."cv"("puesto");

-- CreateIndex
CREATE INDEX "cv_provincia_idx" ON "public"."cv"("provincia");

-- AddForeignKey
ALTER TABLE "public"."cv" ADD CONSTRAINT "cv_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS to match the other public tables (locked to the anon REST API;
-- Prisma bypasses as table owner).
ALTER TABLE "public"."cv" ENABLE ROW LEVEL SECURITY;
