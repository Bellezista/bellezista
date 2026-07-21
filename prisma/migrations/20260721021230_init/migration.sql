-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "private";

-- CreateEnum
CREATE TYPE "TipoAnuncio" AS ENUM ('MAQUINARIA');

-- CreateEnum
CREATE TYPE "EstadoAnuncio" AS ENUM ('ACTIVO', 'DESTACADO', 'RESERVADO', 'VENDIDO', 'RETIRADO');

-- CreateEnum
CREATE TYPE "CategoriaMaquinaria" AS ENUM ('APARATOLOGIA', 'MOBILIARIO', 'EQUIPAMIENTO');

-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('NUEVO', 'COMO_NUEVO', 'BUEN_ESTADO', 'REQUIERE_REVISION');

-- CreateEnum
CREATE TYPE "NivelServicio" AS ENUM ('BASICO', 'VENTA_PROTEGIDA', 'VENTA_PREMIUM');

-- CreateEnum
CREATE TYPE "EstadoOperacion" AS ENUM ('PENDIENTE_DE_PAGO', 'PAGADO_EN_REVISION', 'LIBERADO', 'INCIDENCIA_ABIERTA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('USUARIO', 'ADMIN');

-- CreateTable
CREATE TABLE "anuncio" (
    "id" UUID NOT NULL,
    "tipo" "TipoAnuncio" NOT NULL,
    "titulo" TEXT NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "ciudad_provincia" TEXT NOT NULL,
    "fotos" TEXT[],
    "estado" "EstadoAnuncio" NOT NULL DEFAULT 'ACTIVO',
    "propietario_id" UUID NOT NULL,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maquinaria" (
    "anuncio_id" UUID NOT NULL,
    "categoria" "CategoriaMaquinaria" NOT NULL,
    "subcategoria" TEXT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "numero_serie" TEXT,
    "descripcion" TEXT,
    "anio" INTEGER,
    "horas_de_uso" INTEGER,
    "beauty_score" DECIMAL(3,1),
    "estado_equipo" "EstadoEquipo" NOT NULL,
    "nivel_de_servicio" "NivelServicio" NOT NULL DEFAULT 'BASICO',
    "es_medico_estetico" BOOLEAN NOT NULL DEFAULT false,
    "fecha_puesta_en_marcha" DATE,
    "video" TEXT,
    "factura" TEXT,

    CONSTRAINT "maquinaria_pkey" PRIMARY KEY ("anuncio_id")
);

-- CreateTable
CREATE TABLE "conversacion" (
    "id" UUID NOT NULL,
    "anuncio_id" UUID NOT NULL,
    "interesado_id" UUID NOT NULL,
    "propietario_id" UUID NOT NULL,
    "fecha_ultima_actividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensaje" (
    "id" UUID NOT NULL,
    "conversacion_id" UUID NOT NULL,
    "autor_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operacion" (
    "id" UUID NOT NULL,
    "anuncio_id" UUID NOT NULL,
    "propietario_id" UUID NOT NULL,
    "comprador_id" UUID NOT NULL,
    "precio_final" DECIMAL(12,2),
    "comision" DECIMAL(12,2),
    "estado_operacion" "EstadoOperacion" NOT NULL DEFAULT 'PENDIENTE_DE_PAGO',
    "fecha_pago" TIMESTAMP(3),
    "plazo_revision" INTEGER,
    "fecha_liberacion" TIMESTAMP(3),

    CONSTRAINT "operacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'USUARIO',
    "suspendido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."contacto" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anuncio_tipo_estado_idx" ON "anuncio"("tipo", "estado");

-- CreateIndex
CREATE INDEX "anuncio_ciudad_provincia_idx" ON "anuncio"("ciudad_provincia");

-- CreateIndex
CREATE INDEX "maquinaria_categoria_idx" ON "maquinaria"("categoria");

-- CreateIndex
CREATE INDEX "maquinaria_marca_idx" ON "maquinaria"("marca");

-- CreateIndex
CREATE UNIQUE INDEX "conversacion_anuncio_id_interesado_id_key" ON "conversacion"("anuncio_id", "interesado_id");

-- CreateIndex
CREATE INDEX "mensaje_conversacion_id_fecha_hora_idx" ON "mensaje"("conversacion_id", "fecha_hora");

-- CreateIndex
CREATE UNIQUE INDEX "contacto_usuario_id_key" ON "private"."contacto"("usuario_id");

-- AddForeignKey
ALTER TABLE "anuncio" ADD CONSTRAINT "anuncio_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maquinaria" ADD CONSTRAINT "maquinaria_anuncio_id_fkey" FOREIGN KEY ("anuncio_id") REFERENCES "anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversacion" ADD CONSTRAINT "conversacion_anuncio_id_fkey" FOREIGN KEY ("anuncio_id") REFERENCES "anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversacion" ADD CONSTRAINT "conversacion_interesado_id_fkey" FOREIGN KEY ("interesado_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversacion" ADD CONSTRAINT "conversacion_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacion" ADD CONSTRAINT "operacion_anuncio_id_fkey" FOREIGN KEY ("anuncio_id") REFERENCES "anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."contacto" ADD CONSTRAINT "contacto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
