-- Professional subscription plans for Traspasos.
CREATE TYPE "public"."PlanPro" AS ENUM ('BASICO', 'PROFESIONAL', 'ILIMITADO');

CREATE TABLE "public"."suscripcion_pro" (
  "usuario_id" UUID NOT NULL,
  "plan" "public"."PlanPro" NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'activa',
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "vigente_hasta" TIMESTAMP(3),
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "suscripcion_pro_pkey" PRIMARY KEY ("usuario_id")
);
CREATE UNIQUE INDEX "suscripcion_pro_stripe_customer_id_key" ON "public"."suscripcion_pro" ("stripe_customer_id");
CREATE UNIQUE INDEX "suscripcion_pro_stripe_subscription_id_key" ON "public"."suscripcion_pro" ("stripe_subscription_id");
ALTER TABLE "public"."suscripcion_pro"
  ADD CONSTRAINT "suscripcion_pro_usuario_id_fkey" FOREIGN KEY ("usuario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."suscripcion_pro" ENABLE ROW LEVEL SECURITY;
