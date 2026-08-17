-- Lead capture for the SoluciónOK free professional-management request (Barcelona).
CREATE TABLE "public"."solicitud_gestion" (
  "id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "titulo" TEXT,
  "precio" DECIMAL(12,2),
  "provincia" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "solicitud_gestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "solicitud_gestion_usuario_id_idx" ON "public"."solicitud_gestion" ("usuario_id");
ALTER TABLE "public"."solicitud_gestion"
  ADD CONSTRAINT "solicitud_gestion_usuario_id_fkey" FOREIGN KEY ("usuario_id")
  REFERENCES "public"."usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."solicitud_gestion" ENABLE ROW LEVEL SECURITY;
