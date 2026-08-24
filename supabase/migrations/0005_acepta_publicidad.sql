-- Extends the auth.users -> public.usuario sync trigger to also persist the
-- advertising-consent opt-in given at registration (raw_user_meta_data.
-- acepta_publicidad). Everything else is unchanged from 0003.

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.usuario (id, nombre, rol, acepta_publicidad)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    'USUARIO',
    coalesce((new.raw_user_meta_data ->> 'acepta_publicidad')::boolean, false)
  );

  insert into private.contacto (id, usuario_id, email)
  values (gen_random_uuid(), new.id, new.email);

  return new;
end;
$$;
