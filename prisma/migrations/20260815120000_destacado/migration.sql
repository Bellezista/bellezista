-- Paid "destacado" for listings + a simple-payment ledger (destacado, Kit Traspaso).

ALTER TABLE "public"."anuncio" ADD COLUMN "destacado_hasta" TIMESTAMP(3);

CREATE TABLE "public"."pago_anuncio" (
  "id" UUID NOT NULL,
  "stripe_session_id" TEXT NOT NULL,
  "anuncio_id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "tipo" TEXT NOT NULL,
  "importe" INTEGER NOT NULL DEFAULT 0,
  "moneda" TEXT NOT NULL DEFAULT 'eur',
  "dias" INTEGER,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pago_anuncio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pago_anuncio_stripe_session_id_key" ON "public"."pago_anuncio" ("stripe_session_id");
CREATE INDEX "pago_anuncio_anuncio_id_idx" ON "public"."pago_anuncio" ("anuncio_id");
CREATE INDEX "pago_anuncio_usuario_id_idx" ON "public"."pago_anuncio" ("usuario_id");

ALTER TABLE "public"."pago_anuncio"
  ADD CONSTRAINT "pago_anuncio_anuncio_id_fkey" FOREIGN KEY ("anuncio_id")
  REFERENCES "public"."anuncio" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."pago_anuncio" ENABLE ROW LEVEL SECURITY;
