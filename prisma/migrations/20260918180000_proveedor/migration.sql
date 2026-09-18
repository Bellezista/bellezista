-- CreateEnum
CREATE TYPE "public"."CategoriaProveedor" AS ENUM ('INGENIERIA_LICENCIAS', 'GESTORIA', 'MARKETING', 'ACADEMIA', 'NOTARIA', 'ASEGURADORA', 'FINANCIERA', 'DISTRIBUIDOR_APARATOLOGIA');

-- CreateTable
CREATE TABLE "public"."proveedor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "categoria" "public"."CategoriaProveedor" NOT NULL,
    "zona_cobertura" TEXT NOT NULL,
    "descripcion" TEXT,
    "logo" TEXT,
    "web" TEXT,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proveedor_categoria_idx" ON "public"."proveedor"("categoria");
