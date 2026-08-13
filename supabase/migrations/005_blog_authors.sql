-- ═══════════════════════════════════════════════════════════════════
-- JM Majiwa — denormalised author display fields on blog_posts
-- ═══════════════════════════════════════════════════════════════════

alter table public.blog_posts
  add column if not exists author_name text,
  add column if not exists author_bio text,
  add column if not exists author_avatar_url text;
