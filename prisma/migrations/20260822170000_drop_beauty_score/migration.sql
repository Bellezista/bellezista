-- "Beauty score" field removed from Maquinaria at the client's request.
ALTER TABLE "public"."maquinaria" DROP COLUMN IF EXISTS "beauty_score";
