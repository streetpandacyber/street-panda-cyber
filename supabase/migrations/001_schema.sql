-- ═══════════════════════════════════════════════════════════════════
-- JM Majiwa — Digital Marketplace Schema
-- Run via: supabase db push   (or paste into the Supabase SQL editor)
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── PROFILES ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  country text not null default 'Kenya',
  city text,
  bio text,
  is_admin boolean not null default false,
  newsletter_subscribed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── CATEGORIES ────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  image_url text,
  color text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─── PRODUCTS ──────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  category_id uuid references public.categories (id) on delete set null,
  price numeric(12, 2) not null default 0,
  sale_price numeric(12, 2),
  currency text not null default 'KES',
  thumbnail_url text,
  gallery_urls text[],
  preview_urls text[],
  file_url text,
  file_size text,
  file_format text,
  tags text[],
  features text[],
  what_is_included text[],
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new boolean not null default false,
  total_downloads integer not null default 0,
  total_sales integer not null default 0,
  view_count integer not null default 0,
  average_rating numeric(3, 2),
  review_count integer not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── BUNDLES ───────────────────────────────────────────────────────
create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  original_price numeric(12, 2) not null default 0,
  bundle_price numeric(12, 2) not null default 0,
  currency text not null default 'KES',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.bundle_products (
  bundle_id uuid not null references public.bundles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (bundle_id, product_id)
);

-- ─── ORDERS ────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'KES',
  payment_method text not null default 'mpesa',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  mpesa_transaction_id text,
  mpesa_phone text,
  checkout_request_id text,
  coupon_id uuid,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'cancelled')),
  download_token text unique,
  download_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── ORDER ITEMS ───────────────────────────────────────────────────
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  bundle_id uuid references public.bundles (id) on delete set null,
  title text not null,
  price numeric(12, 2) not null default 0,
  quantity integer not null default 1,
  download_count integer not null default 0,
  max_downloads integer not null default 5
);

-- Add FK from orders.coupon_id after coupons exists (created below).

-- ─── REVIEWS ───────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── COUPONS ───────────────────────────────────────────────────────
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'percentage'
    check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12, 2) not null default 0,
  minimum_order numeric(12, 2) not null default 0,
  maximum_discount numeric(12, 2),
  usage_limit integer,
  usage_count integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.orders
  drop constraint if exists orders_coupon_id_fkey;
alter table public.orders
  add constraint orders_coupon_id_fkey
  foreign key (coupon_id) references public.coupons (id) on delete set null;

-- ─── WISHLIST ──────────────────────────────────────────────────────
create table if not exists public.wishlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ─── NEWSLETTER SUBSCRIBERS ────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ─── BLOG POSTS ────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  author_id uuid references public.profiles (id) on delete set null,
  category text,
  tags text[],
  is_published boolean not null default false,
  is_featured boolean not null default false,
  meta_title text,
  meta_description text,
  view_count integer not null default 0,
  read_time integer,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── PRODUCT VIEWS (analytics) ─────────────────────────────────────
create table if not exists public.product_views (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  viewed_at timestamptz not null default now()
);

-- ─── INDEXES ───────────────────────────────────────────────────────
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_published on public.products (is_published);
create index if not exists idx_products_featured on public.products (is_featured);
create index if not exists idx_products_best_seller on public.products (is_best_seller);
create index if not exists idx_products_sales on public.products (total_sales desc);
create index if not exists idx_products_created on public.products (created_at desc);
create index if not exists idx_products_tags on public.products using gin (tags);
create index if not exists idx_categories_featured on public.categories (is_featured);
create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_orders_email on public.orders (customer_email);
create index if not exists idx_orders_checkout on public.orders (checkout_request_id);
create index if not exists idx_orders_created on public.orders (created_at desc);
create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_order_items_product on public.order_items (product_id);
create index if not exists idx_reviews_product on public.reviews (product_id);
create index if not exists idx_bundle_products_product on public.bundle_products (product_id);
create index if not exists idx_blog_published on public.blog_posts (is_published, published_at desc);
create index if not exists idx_product_views_product on public.product_views (product_id);

-- ─── TRIGGERS: updated_at ──────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_updated on public.blog_posts;
create trigger trg_blog_updated
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ─── TRIGGER: auto-create profile on signup ────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, newsletter_subscribed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'newsletter_subscribed')::boolean, true)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── TRIGGER: auto-generate order numbers (JMM-YYYYMMDD-XXXX) ─────
create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
declare
  candidate text;
  attempts integer := 0;
begin
  if new.order_number is null or new.order_number = '' then
    loop
      candidate := 'JMM-' || to_char(now(), 'YYYYMMDD') || '-' ||
                   lpad((floor(random() * 10000))::int::text, 4, '0');
      begin
        if not exists (select 1 from public.orders where order_number = candidate) then
          new.order_number := candidate;
          exit;
        end if;
      end;
      attempts := attempts + 1;
      if attempts > 20 then
        raise exception 'Could not generate a unique order number';
      end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_number on public.orders;
create trigger trg_orders_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- ─── RPC HELPERS ───────────────────────────────────────────────────
create or replace function public.increment_product_sales(product_row_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.products
  set total_sales = total_sales + 1
  where id = product_row_id;
$$;

create or replace function public.increment_product_downloads(product_row_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.products
  set total_downloads = total_downloads + 1
  where id = product_row_id;
$$;

create or replace function public.increment_product_views(product_row_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.products
  set view_count = view_count + 1
  where id = product_row_id;
$$;

-- ─── ADMIN HELPER ──────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.wishlist enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.blog_posts enable row level security;
alter table public.product_views enable row level security;

-- Profiles: read/update own; admins manage all
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Categories & products: public read for published content
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_published = true or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Bundles
drop policy if exists "bundles_public_read" on public.bundles;
create policy "bundles_public_read" on public.bundles
  for select using (is_published = true or public.is_admin());

drop policy if exists "bundle_products_public_read" on public.bundle_products;
create policy "bundle_products_public_read" on public.bundle_products
  for select using (true);

drop policy if exists "bundles_admin_write" on public.bundles;
create policy "bundles_admin_write" on public.bundles
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders: owners can read their own; admins manage all.
-- (Order creation happens via the service role in API routes.)
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- Reviews: public read, authenticated insert, admin moderate
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_auth" on public.reviews;
create policy "reviews_insert_auth" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- Coupons: only validation via API/service role; admins manage
drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Wishlist: own rows only
drop policy if exists "wishlist_own_all" on public.wishlist;
create policy "wishlist_own_all" on public.wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Newsletter: anyone can subscribe (API), admins manage
drop policy if exists "newsletter_admin_all" on public.newsletter_subscribers;
create policy "newsletter_admin_all" on public.newsletter_subscribers
  for all using (public.is_admin()) with check (public.is_admin());

-- Blog: public read for published
drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read" on public.blog_posts
  for select using (is_published = true or public.is_admin());

drop policy if exists "blog_admin_write" on public.blog_posts;
create policy "blog_admin_write" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Product views: anyone can insert analytics rows
drop policy if exists "product_views_insert" on public.product_views;
create policy "product_views_insert" on public.product_views
  for insert with check (true);

drop policy if exists "product_views_admin_read" on public.product_views;
create policy "product_views_admin_read" on public.product_views
  for select using (public.is_admin());

-- ─── STORAGE BUCKET for product files ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('products', 'products', false)
on conflict (id) do nothing;

drop policy if exists "products_bucket_admin_read" on storage.objects;
create policy "products_bucket_admin_read" on storage.objects
  for select using (bucket_id = 'products' and public.is_admin());
