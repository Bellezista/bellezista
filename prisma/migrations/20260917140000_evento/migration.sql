-- Sector events for the "Próximos eventos" block (portada + Actualidad).
CREATE TABLE "public"."evento" (
  "id" UUID NOT NULL,
  "titulo" TEXT NOT NULL,
  "ciudad" TEXT,
  "modalidad" TEXT,
  "fecha" TIMESTAMP(3) NOT NULL,
  "url" TEXT,
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "evento_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "evento_fecha_idx" ON "public"."evento" ("fecha");
ALTER TABLE "public"."evento" ENABLE ROW LEVEL SECURITY;
