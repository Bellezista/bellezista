-- Client request: remove the "fecha de puesta en marcha" field from Maquinaria.
ALTER TABLE "public"."maquinaria" DROP COLUMN IF EXISTS "fecha_puesta_en_marcha";
