-- Ofertas module: paid standalone promotion landing pages.

CREATE TYPE "public"."EstadoOferta" AS ENUM ('PENDIENTE_DE_PAGO', 'ACTIVA', 'CADUCADA');
CREATE TYPE "public"."VigenciaOferta" AS ENUM ('DIARIA', 'SEMANAL');

CREATE TABLE "public"."oferta" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "precio" DECIMAL(12,2) NOT NULL,
  "precio_original" DECIMAL(12,2),
  "tipo_negocio" "public"."TipoNegocioTraspaso" NOT NULL,
  "foto" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "ciudad_provincia" TEXT,
  "vigencia" "public"."VigenciaOferta" NOT NULL,
  "estado" "public"."EstadoOferta" NOT NULL DEFAULT 'PENDIENTE_DE_PAGO',
  "fecha_caducidad" TIMESTAMP(3),
  "propietario_id" UUID NOT NULL,
  "stripe_session_id" TEXT,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "oferta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oferta_slug_key" ON "public"."oferta" ("slug");
CREATE UNIQUE INDEX "oferta_stripe_session_id_key" ON "public"."oferta" ("stripe_session_id");
CREATE INDEX "oferta_propietario_id_idx" ON "public"."oferta" ("propietario_id");

ALTER TABLE "public"."oferta"
  ADD CONSTRAINT "oferta_propietario_id_fkey" FOREIGN KEY ("propietario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."oferta" ENABLE ROW LEVEL SECURITY;
