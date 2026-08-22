-- Payment infrastructure: commission + retention (escrow) via Stripe Connect.

-- New states for incidencia resolution.
ALTER TYPE "public"."EstadoOperacion" ADD VALUE IF NOT EXISTS 'REEMBOLSADO';
ALTER TYPE "public"."EstadoOperacion" ADD VALUE IF NOT EXISTS 'CANCELADO';

-- Seller Connect account (Express) + cached payouts_enabled flag.
ALTER TABLE "public"."usuario"
  ADD COLUMN "stripe_connect_id" TEXT,
  ADD COLUMN "cobros_activos" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "usuario_stripe_connect_id_key"
  ON "public"."usuario" ("stripe_connect_id");

-- Operacion: Stripe references, incidencia reason, timestamps.
ALTER TABLE "public"."operacion"
  ADD COLUMN "motivo_incidencia" TEXT,
  ADD COLUMN "stripe_session_id" TEXT,
  ADD COLUMN "stripe_payment_intent_id" TEXT,
  ADD COLUMN "stripe_transfer_id" TEXT,
  ADD COLUMN "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "operacion_stripe_session_id_key"
  ON "public"."operacion" ("stripe_session_id");
CREATE INDEX "operacion_comprador_id_idx" ON "public"."operacion" ("comprador_id");
CREATE INDEX "operacion_propietario_id_idx" ON "public"."operacion" ("propietario_id");
CREATE INDEX "operacion_estado_operacion_idx" ON "public"."operacion" ("estado_operacion");

-- FKs so Operacion.comprador / .propietario resolve to usuario.
ALTER TABLE "public"."operacion"
  ADD CONSTRAINT "operacion_propietario_id_fkey" FOREIGN KEY ("propietario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."operacion"
  ADD CONSTRAINT "operacion_comprador_id_fkey" FOREIGN KEY ("comprador_id")
  REFERENCES "public"."usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
