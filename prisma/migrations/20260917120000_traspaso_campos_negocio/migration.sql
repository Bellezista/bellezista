-- Per-business-type fields for Traspaso, plus the universal staff fields.
ALTER TABLE "public"."traspaso"
  ADD COLUMN IF NOT EXISTS "tocadores" INTEGER,
  ADD COLUMN IF NOT EXISTS "lavacabezas" INTEGER,
  ADD COLUMN IF NOT EXISTS "sillones_barberia" INTEGER,
  ADD COLUMN IF NOT EXISTS "puestos_manicura" INTEGER,
  ADD COLUMN IF NOT EXISTS "puestos_pedicura" INTEGER,
  ADD COLUMN IF NOT EXISTS "puestos_trabajo" INTEGER,
  ADD COLUMN IF NOT EXISTS "lavamanos_por_cabina" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "tiene_ducha" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "incluye_personal" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "antiguedad_personal" TEXT;
