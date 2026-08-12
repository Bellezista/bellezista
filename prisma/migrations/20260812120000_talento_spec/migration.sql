-- Talento spec (client CV_Estandar): enum value changes, new Cv fields,
-- and the per-puesto technique block (cv_tecnica).

-- Jornada: INDIFERENTE -> POR_HORAS (no rows use the old value).
ALTER TYPE "public"."JornadaTalento" RENAME VALUE 'INDIFERENTE' TO 'POR_HORAS';

-- Disponibilidad: swap the two unused values for the client's options.
ALTER TYPE "public"."DisponibilidadTalento" RENAME VALUE 'EN_DOS_SEMANAS' TO 'CON_PREAVISO';
ALTER TYPE "public"."DisponibilidadTalento" RENAME VALUE 'EN_UN_MES' TO 'FINES_DE_SEMANA';

-- Renaming enum labels invalidates the stored column defaults; reset them.
ALTER TABLE "public"."cv" ALTER COLUMN "jornada" SET DEFAULT 'POR_HORAS';
ALTER TABLE "public"."cv" ALTER COLUMN "disponibilidad" SET DEFAULT 'A_CONVENIR';

-- Cv: expectativa salarial + split formación (titulación / cursos); drop the
-- old free-text fields now replaced by the structured technique block.
ALTER TABLE "public"."cv"
  ADD COLUMN "expectativa_salarial" TEXT,
  ADD COLUMN "titulacion" TEXT,
  ADD COLUMN "cursos" TEXT;

ALTER TABLE "public"."cv"
  DROP COLUMN "formacion",
  DROP COLUMN "habilidades";

-- Per-puesto technique checklist. One row per declared technique (its presence
-- means "sabe usarla"); anios = years of experience with it.
CREATE TABLE "public"."cv_tecnica" (
  "id" UUID NOT NULL,
  "cv_id" UUID NOT NULL,
  "tecnica" TEXT NOT NULL,
  "anios" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "cv_tecnica_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cv_tecnica_cv_id_tecnica_key" ON "public"."cv_tecnica" ("cv_id", "tecnica");
CREATE INDEX "cv_tecnica_cv_id_idx" ON "public"."cv_tecnica" ("cv_id");
CREATE INDEX "cv_tecnica_tecnica_idx" ON "public"."cv_tecnica" ("tecnica");

ALTER TABLE "public"."cv_tecnica"
  ADD CONSTRAINT "cv_tecnica_cv_id_fkey" FOREIGN KEY ("cv_id")
  REFERENCES "public"."cv" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."cv_tecnica" ENABLE ROW LEVEL SECURITY;
