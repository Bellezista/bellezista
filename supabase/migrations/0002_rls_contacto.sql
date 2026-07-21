-- Non-negotiable security requirement (CLAUDE.md): the listing owner's
-- phone/email must never be exposed to anyone else, under any circumstance --
-- not via the UI, not via any API route, not via a direct database query.
--
-- IMPORTANT: this policy is defense-in-depth, not the primary guarantee. It
-- protects against the "someone hand-crafts a REST call with the publishable
-- key" threat. It does NOT protect against the app's own Prisma connection,
-- which uses a privileged role that bypasses RLS by design -- that side of
-- the guarantee is app-code discipline (see plan's security section): only
-- src/lib/actions/contacto.ts may ever query this model, always filtered to
-- the current session's own id.

alter table private.contacto enable row level security;

-- Only the owning user may ever read their own contact row. No insert/update
-- policy exists for anon/authenticated -- writes only happen through the
-- trusted server path (the auth trigger on signup, and the account-settings
-- Server Action), both of which use Prisma's privileged connection and so
-- don't need an RLS policy to be allowed through.
create policy "usuario reads own contacto"
  on private.contacto
  for select
  to authenticated
  using (auth.uid() = usuario_id);
