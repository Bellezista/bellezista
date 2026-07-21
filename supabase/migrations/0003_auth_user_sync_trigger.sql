-- Creates the corresponding public.usuario + private.contacto rows whenever a
-- user completes Supabase Auth signup. `nombre` falls back to the local part
-- of their email if no display name was supplied at signup; `telefono` is
-- left null and collected later at profile completion -- both are
-- assumptions flagged in the plan since the brief doesn't specify contact
-- collection timing.
--
-- security definer + an explicit search_path is the standard safe pattern for
-- a trigger function that needs to write across schemas (public + private)
-- regardless of which role fired the insert on auth.users.

-- Prisma's @default(uuid()) generates `id` client-side (in Prisma Client) and
-- @updatedAt sets `actualizado_en` client-side on every Prisma write -- NEITHER
-- is a real Postgres column default, so a raw SQL insert like this trigger's
-- needs its own values for both, or they come through NULL and violate the
-- not-null constraints. Adding DB-level defaults here since Contacto rows are
-- currently only ever created by this trigger, never by Prisma.
alter table private.contacto alter column id set default gen_random_uuid();
alter table private.contacto alter column actualizado_en set default now();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.usuario (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    'USUARIO'
  );

  insert into private.contacto (id, usuario_id, email)
  values (gen_random_uuid(), new.id, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_auth_user();
