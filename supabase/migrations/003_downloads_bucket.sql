-- ═══════════════════════════════════════════════════════════════════
-- JM Majiwa — private "downloads" bucket for digital product files
-- (images live in the public "media" bucket; "products" remains as a
--  legacy fallback for files uploaded before this migration)
-- ═══════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('downloads', 'downloads', false)
on conflict (id) do nothing;

drop policy if exists "downloads_admin_read" on storage.objects;
create policy "downloads_admin_read" on storage.objects
  for select using (bucket_id = 'downloads' and public.is_admin());

drop policy if exists "downloads_admin_insert" on storage.objects;
create policy "downloads_admin_insert" on storage.objects
  for insert with check (bucket_id = 'downloads' and public.is_admin());

drop policy if exists "downloads_admin_update" on storage.objects;
create policy "downloads_admin_update" on storage.objects
  for update using (bucket_id = 'downloads' and public.is_admin());
