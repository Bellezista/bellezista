-- Talento pay-to-access: unlocks, prepaid credits (bono) and a payment ledger.

CREATE TABLE "public"."cv_desbloqueo" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "cv_id" UUID NOT NULL,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cv_desbloqueo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cv_desbloqueo_usuario_id_cv_id_key" ON "public"."cv_desbloqueo" ("usuario_id", "cv_id");
CREATE INDEX "cv_desbloqueo_usuario_id_idx" ON "public"."cv_desbloqueo" ("usuario_id");
CREATE INDEX "cv_desbloqueo_cv_id_idx" ON "public"."cv_desbloqueo" ("cv_id");

ALTER TABLE "public"."cv_desbloqueo"
  ADD CONSTRAINT "cv_desbloqueo_usuario_id_fkey" FOREIGN KEY ("usuario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."cv_desbloqueo"
  ADD CONSTRAINT "cv_desbloqueo_cv_id_fkey" FOREIGN KEY ("cv_id")
  REFERENCES "public"."cv" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."cv_desbloqueo" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."talento_credito" (
  "usuario_id" UUID NOT NULL,
  "saldo" INTEGER NOT NULL DEFAULT 0,
  "actualizado_en" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "talento_credito_pkey" PRIMARY KEY ("usuario_id")
);

ALTER TABLE "public"."talento_credito"
  ADD CONSTRAINT "talento_credito_usuario_id_fkey" FOREIGN KEY ("usuario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."talento_credito" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."talento_pago" (
  "id" UUID NOT NULL,
  "stripe_session_id" TEXT NOT NULL,
  "usuario_id" UUID NOT NULL,
  "tipo" TEXT NOT NULL,
  "cv_id" UUID,
  "creditos" INTEGER NOT NULL DEFAULT 0,
  "importe" INTEGER NOT NULL DEFAULT 0,
  "moneda" TEXT NOT NULL DEFAULT 'eur',
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "talento_pago_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "talento_pago_stripe_session_id_key" ON "public"."talento_pago" ("stripe_session_id");
CREATE INDEX "talento_pago_usuario_id_idx" ON "public"."talento_pago" ("usuario_id");

ALTER TABLE "public"."talento_pago" ENABLE ROW LEVEL SECURITY;
