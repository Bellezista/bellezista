-- In-app notifications.
CREATE TABLE "public"."notificacion" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "cuerpo" TEXT,
  "url" TEXT,
  "leida" BOOLEAN NOT NULL DEFAULT false,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notificacion_usuario_id_leida_idx" ON "public"."notificacion" ("usuario_id", "leida");
ALTER TABLE "public"."notificacion"
  ADD CONSTRAINT "notificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."notificacion" ENABLE ROW LEVEL SECURITY;
