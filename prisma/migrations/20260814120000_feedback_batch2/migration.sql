-- Client feedback batch 2: traspaso licence type, CV candidate name, and CV
-- salary expectation as fixed ranges.

-- 7) Traspaso: replace the incluye_licencia boolean with a "tipo de licencia".
CREATE TYPE "public"."TipoLicenciaTraspaso" AS ENUM (
  'SALON_BELLEZA', 'CENTRO_ESTETICA', 'PELUQUERIA', 'SANITARIA', 'OTROS'
);
ALTER TABLE "public"."traspaso" DROP COLUMN "incluye_licencia";
ALTER TABLE "public"."traspaso" ADD COLUMN "tipo_licencia" "public"."TipoLicenciaTraspaso";

-- 11) CV: candidate name.
ALTER TABLE "public"."cv" ADD COLUMN "nombre" TEXT;

-- 13) CV: salary expectation as an enum of ranges (was free text).
CREATE TYPE "public"."ExpectativaSalarial" AS ENUM (
  'SEGUN_CONVENIO', 'R_1200_1500', 'R_1500_1800', 'R_1800_MAS'
);
ALTER TABLE "public"."cv" DROP COLUMN "expectativa_salarial";
ALTER TABLE "public"."cv" ADD COLUMN "expectativa_salarial" "public"."ExpectativaSalarial";
