-- Local characteristics for Traspaso listings (catalog filters).
ALTER TABLE "public"."traspaso"
  ADD COLUMN "en_funcionamiento" BOOLEAN,
  ADD COLUMN "a_pie_de_calle" BOOLEAN,
  ADD COLUMN "reformado" BOOLEAN,
  ADD COLUMN "con_clientela" BOOLEAN,
  ADD COLUMN "con_aparatologia" BOOLEAN;
