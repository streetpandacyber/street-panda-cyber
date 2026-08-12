-- ═══════════════════════════════════════════════════════════════════
-- JM Majiwa — Backend extensions (download logs, media bucket, indexes)
-- ═══════════════════════════════════════════════════════════════════

-- ─── DOWNLOAD LOGS (audit trail for every file download) ───────────
create table if not exists public.download_logs (
  id bigint generated always as identity primary key,
  order_id uuid references public.orders (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_download_logs_item on public.download_logs (order_item_id);
create index if not exists idx_download_logs_created on public.download_logs (created_at desc);

alter table public.download_logs enable row level security;

drop policy if exists "download_logs_admin_read" on public.download_logs;
create policy "download_logs_admin_read" on public.download_logs
  for select using (public.is_admin());

-- ─── PUBLIC MEDIA BUCKET for product images ────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone can read public media
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

-- Only admins upload into media
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- Admins manage the private products bucket (uploads via admin API)
drop policy if exists "products_bucket_admin_insert" on storage.objects;
create policy "products_bucket_admin_insert" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

-- ─── ANALYTICS INDEXES ─────────────────────────────────────────────
create index if not exists idx_orders_paid_created
  on public.orders (payment_status, created_at desc);
create index if not exists idx_profiles_created on public.profiles (created_at desc);
