-- Kit Traspaso: paid document-preparation service (sold + charged online, docs
-- prepared by hand by SoluciónOK).

CREATE TABLE "public"."kit_traspaso" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "anuncio_id" UUID,
  "stripe_session_id" TEXT,
  "importe" INTEGER NOT NULL DEFAULT 0,
  "moneda" TEXT NOT NULL DEFAULT 'eur',
  "estado" TEXT NOT NULL DEFAULT 'pendiente_pago',
  "datos" JSONB,
  "fotos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "kit_traspaso_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "kit_traspaso_stripe_session_id_key" ON "public"."kit_traspaso" ("stripe_session_id");
CREATE INDEX "kit_traspaso_usuario_id_idx" ON "public"."kit_traspaso" ("usuario_id");

ALTER TABLE "public"."kit_traspaso"
  ADD CONSTRAINT "kit_traspaso_usuario_id_fkey" FOREIGN KEY ("usuario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."kit_traspaso" ENABLE ROW LEVEL SECURITY;
