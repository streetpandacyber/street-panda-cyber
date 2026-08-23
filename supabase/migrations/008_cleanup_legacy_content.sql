-- Keep the public editorial catalog current and remove legacy duplicate entries.
update public.blog_posts
set
  is_published = false,
  is_featured = false,
  updated_at = now()
where slug in (
  '10-chatgpt-prompts-kenyan-entrepreneur',
  'how-to-use-canva-like-a-pro'
);

update public.blog_posts
set
  title = '10 ChatGPT Prompts Every Kenyan Entrepreneur Must Use in 2026',
  slug = 'chatgpt-prompts-kenyan-entrepreneurs-2026',
  updated_at = now()
where slug = 'chatgpt-prompts-kenyan-entrepreneurs-2024'
  and not exists (
    select 1 from public.blog_posts existing
    where existing.slug = 'chatgpt-prompts-kenyan-entrepreneurs-2026'
  );

update public.blog_posts
set
  title = 'The Best Free AI Tools for Kenyan Students in 2026',
  slug = 'best-ai-tools-kenyan-students-2026',
  updated_at = now()
where slug = 'best-ai-tools-kenyan-students-2024'
  and not exists (
    select 1 from public.blog_posts existing
    where existing.slug = 'best-ai-tools-kenyan-students-2026'
  );

-- Seed product and bundle IDs are fixtures, not verified inventory.
update public.products
set is_published = false, is_featured = false, is_best_seller = false, is_new = false
where id::text like '00000000-0000-4000-8000-0000000000p%'
   or id::text like '00000000-0000-4000-8000-0000000001p%';

update public.bundles
set is_published = false, is_featured = false
where id::text in (
  '00000000-0000-4000-8000-0000000000b1',
  '00000000-0000-4000-8000-0000000000b2',
  '00000000-0000-4000-8000-0000000000b3'
);
