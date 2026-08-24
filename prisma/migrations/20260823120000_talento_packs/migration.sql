-- Talento pricing overhaul: time-based unlimited access packs.
-- Adds the "unlimited access until" date to the per-owner Talento access row.
ALTER TABLE "public"."talento_credito"
  ADD COLUMN IF NOT EXISTS "acceso_ilimitado_hasta" TIMESTAMP(3);
