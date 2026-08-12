-- ═══════════════════════════════════════════════════════════════════
-- JM Majiwa — let signed-in users upload their own avatar into /avatars
-- ═══════════════════════════════════════════════════════════════════

drop policy if exists "media_auth_avatar_insert" on storage.objects;
create policy "media_auth_avatar_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'avatars'
  );

drop policy if exists "media_auth_avatar_update" on storage.objects;
create policy "media_auth_avatar_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'avatars'
  );
