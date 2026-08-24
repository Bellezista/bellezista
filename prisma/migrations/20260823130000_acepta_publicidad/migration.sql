-- Advertising/marketing consent captured at registration (opt-in), separate
-- from the cookie banner.
ALTER TABLE "public"."usuario"
  ADD COLUMN "acepta_publicidad" BOOLEAN NOT NULL DEFAULT false;
