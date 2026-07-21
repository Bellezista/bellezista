-- Two buckets: `fotos-video` (public -- listing photos/video, marketing
-- content meant to be visible in the catalog) and `facturas` (private -- the
-- Maquinaria "factura" financial document). Video's visibility is an
-- assumption flagged in the plan (public, alongside photos) since the brief
-- doesn't state it explicitly.
--
-- Objects are stored under a `{usuario_id}/...` path prefix so storage
-- policies can check ownership via the folder name, the standard Supabase
-- Storage RLS pattern.

insert into storage.buckets (id, name, public)
values ('fotos-video', 'fotos-video', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('facturas', 'facturas', false)
on conflict (id) do nothing;

-- fotos-video: public read (redundant with the bucket's own public flag, but
-- explicit is clearer), owner-only write/update/delete under their own prefix.
create policy "fotos-video publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'fotos-video');

create policy "fotos-video owner can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos-video'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "fotos-video owner can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'fotos-video'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "fotos-video owner can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fotos-video'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- facturas: private end to end, owner-only read/write/update under their own
-- prefix. Admin access (if ever needed) goes through server-side code using
-- the Supabase secret key, which bypasses storage RLS -- no separate admin
-- policy needed.
create policy "facturas owner can read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'facturas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "facturas owner can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'facturas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "facturas owner can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'facturas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
