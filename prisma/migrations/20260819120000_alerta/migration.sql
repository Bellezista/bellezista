-- Saved search alerts (weekly digest).
CREATE TYPE "public"."SeccionAlerta" AS ENUM ('TRASPASOS', 'MAQUINARIA', 'TALENTO');

CREATE TABLE "public"."alerta" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "seccion" "public"."SeccionAlerta" NOT NULL,
  "filtros" JSONB NOT NULL,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "alerta_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "alerta_usuario_id_idx" ON "public"."alerta" ("usuario_id");
ALTER TABLE "public"."alerta"
  ADD CONSTRAINT "alerta_usuario_id_fkey" FOREIGN KEY ("usuario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."alerta" ENABLE ROW LEVEL SECURITY;
