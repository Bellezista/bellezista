-- Defense-in-depth for the `private` Postgres schema (holds Contacto:
-- phone/email). Supabase's PostgREST only exposes schemas explicitly listed
-- in its Data API config (public/graphql_public by default) -- `private` is
-- never one of them, so this table is unreachable via the anon/publishable-key
-- REST API regardless of RLS. These grants/revokes are a second, independent
-- layer in case that exposure config is ever changed by mistake.
--
-- The schema itself is normally created by Prisma's own migration (the
-- datasource block lists `schemas = ["public", "private"]`) -- this is
-- `create schema if not exists` so it's safe to run standalone too.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

alter default privileges in schema private
  revoke all on tables from public, anon, authenticated;
