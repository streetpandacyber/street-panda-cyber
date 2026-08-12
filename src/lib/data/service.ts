/**
 * Server-side data access layer.
 *
 * Every function tries Supabase first (when configured) and gracefully
 * falls back to the bundled demo data, so the marketplace is fully
 * browsable out of the box.
 */
import type { BlogPost, Bundle, Category, Product } from "@/types";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  MOCK_BUNDLES,
  MOCK_CATEGORIES,
  MOCK_POSTS_ALL,
  MOCK_PRODUCTS,
} from "./mock";

export type ProductSort =
  | "newest"
  | "popular"
  | "rating"
  | "price-asc"
  | "price-desc";

export interface ProductQuery {
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  limit?: number;
}

async function trySupabase<T>(
  fn: (db: ReturnType<typeof createClient>) => Promise<T | null>
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await fn(createClient());
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const db = await trySupabase(async (db) => {
    const { data, error } = await db
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return null;
    return data as Category[];
  });
  return db ?? MOCK_CATEGORIES;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const db = await trySupabase(async (db) => {
    let req = db
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_published", true);

    if (query.categorySlug) {
      const { data: cat } = await db
        .from("categories")
        .select("id")
        .eq("slug", query.categorySlug)
        .single();
      if (!cat) return null;
      req = req.eq("category_id", cat.id);
    }
    if (query.search) {
      req = req.ilike("title", `%${query.search}%`);
    }

    switch (query.sort) {
      case "popular":
        req = req.order("total_sales", { ascending: false });
        break;
      case "rating":
        req = req.order("average_rating", { ascending: false });
        break;
      case "price-asc":
        req = req.order("price", { ascending: true });
        break;
      case "price-desc":
        req = req.order("price", { ascending: false });
        break;
      default:
        req = req.order("created_at", { ascending: false });
    }

    if (query.limit) req = req.limit(query.limit);

    const { data, error } = await req;
    if (error || !data?.length) return null;
    return data as unknown as Product[];
  });

  if (db) return db;

  // Demo-data fallback with the same query semantics.
  let products = [...MOCK_PRODUCTS];
  if (query.categorySlug) {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === query.categorySlug);
    products = products.filter((p) => p.category_id === cat?.id);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.short_description?.toLowerCase().includes(s) ||
        p.tags?.some((t) => t.toLowerCase().includes(s))
    );
  }
  switch (query.sort) {
    case "popular":
      products.sort((a, b) => b.total_sales - a.total_sales);
      break;
    case "rating":
      products.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
      break;
    case "price-asc":
      products.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
      break;
    case "price-desc":
      products.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
      break;
    default:
      products.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
  if (query.limit) products = products.slice(0, query.limit);
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await trySupabase(async (db) => {
    const { data, error } = await db
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return data as unknown as Product;
  });
  return db ?? MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 6
): Promise<Product[]> {
  const all = await getProducts({});
  return all
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, limit);
}

export async function getBundles(): Promise<Bundle[]> {
  const db = await trySupabase(async (db) => {
    const { data, error } = await db
      .from("bundles")
      .select("*, products:bundle_products(products(*))")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error || !data?.length) return null;
    type BundleRow = Omit<Bundle, "products"> & {
      products: { products: Product }[];
    };
    return (data as unknown as BundleRow[]).map(({ products, ...rest }) => ({
      ...rest,
      products: products
        .map((bp) => bp.products)
        .filter((prod): prod is Product => Boolean(prod)),
    }));
  });
  return db ?? MOCK_BUNDLES;
}

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  const bundles = await getBundles();
  return bundles.find((b) => b.slug === slug) ?? null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const db = await trySupabase(async (db) => {
    const { data, error } = await db
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    if (error || !data?.length) return null;
    return data as BlogPost[];
  });
  return db ?? MOCK_POSTS_ALL;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = await trySupabase(async (db) => {
    const { data, error } = await db
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return data as BlogPost;
  });
  return db ?? MOCK_POSTS_ALL.find((p) => p.slug === slug) ?? null;
}

/* ───────────── Extended queries for the backend API ───────────── */

export interface PagedQuery extends ProductQuery {
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  page?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
}

function applyDemoFilters(products: Product[], q: PagedQuery): Product[] {
  let list = [...products];
  if (q.categorySlug) {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === q.categorySlug);
    list = list.filter((p) => p.category_id === cat?.id);
  }
  if (q.search) {
    const s = q.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.tags?.some((t) => t.toLowerCase().includes(s))
    );
  }
  if (q.minPrice !== undefined)
    list = list.filter((p) => (p.sale_price ?? p.price) >= (q.minPrice ?? 0));
  if (q.maxPrice !== undefined)
    list = list.filter((p) => (p.sale_price ?? p.price) <= (q.maxPrice ?? Infinity));
  if (q.tags?.length)
    list = list.filter((p) => q.tags!.every((t) => p.tags?.includes(t)));
  if (q.featured) list = list.filter((p) => p.is_featured);
  return list;
}

export async function getProductsPaged(q: PagedQuery = {}): Promise<Paged<Product>> {
  const db = await trySupabase(async (db) => {
    let req = db
      .from("products")
      .select("*, category:categories(*)", { count: "exact" })
      .eq("is_published", true);

    if (q.categorySlug) {
      const { data: cat } = await db
        .from("categories")
        .select("id")
        .eq("slug", q.categorySlug)
        .single();
      if (!cat) return { items: [], total: 0 };
      req = req.eq("category_id", cat.id);
    }
    if (q.search) req = req.ilike("title", `%${q.search}%`);
    if (q.minPrice !== undefined) req = req.gte("price", q.minPrice);
    if (q.maxPrice !== undefined) req = req.lte("price", q.maxPrice);
    if (q.tags?.length) req = req.contains("tags", q.tags);
    if (q.featured) req = req.eq("is_featured", true);

    switch (q.sort) {
      case "popular": req = req.order("total_sales", { ascending: false }); break;
      case "rating": req = req.order("average_rating", { ascending: false }); break;
      case "price-asc": req = req.order("price", { ascending: true }); break;
      case "price-desc": req = req.order("price", { ascending: false }); break;
      default: req = req.order("created_at", { ascending: false });
    }

    const page = q.page ?? 1;
    const limit = q.limit ?? 12;
    req = req.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await req;
    if (error) return null;
    return { items: (data as unknown as Product[]) ?? [], total: count ?? 0 };
  });

  if (db) return db;

  const filtered = applyDemoFilters(MOCK_PRODUCTS, q);
  const page = q.page ?? 1;
  const limit = q.limit ?? 12;
  return {
    items: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
  };
}

export async function getCategoriesWithCounts(): Promise<
  (Category & { product_count: number })[]
> {
  const db = await trySupabase(async (db) => {
    const [cats, counts] = await Promise.all([
      db.from("categories").select("*").order("sort_order", { ascending: true }),
      db.from("products").select("category_id", { count: "exact", head: false }),
    ]);
    if (cats.error || !cats.data?.length) return null;
    const byCat = new Map<string, number>();
    for (const row of counts.data ?? []) {
      const id = (row as { category_id: string | null }).category_id;
      if (id) byCat.set(id, (byCat.get(id) ?? 0) + 1);
    }
    return (cats.data as Category[]).map((c) => ({
      ...c,
      product_count: byCat.get(c.id) ?? 0,
    }));
  });

  if (db) return db;

  return MOCK_CATEGORIES.map((c) => ({
    ...c,
    product_count: MOCK_PRODUCTS.filter((p) => p.category_id === c.id).length,
  }));
}

export async function searchProducts(q: string, limit = 10): Promise<Product[]> {
  if (!q.trim()) return [];
  const db = await trySupabase(async (db) => {
    const { data, error } = await db
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q.toLowerCase()}}`)
      .order("total_sales", { ascending: false })
      .limit(limit);
    if (error || !data?.length) return null;
    return data as unknown as Product[];
  });
  if (db) return db;
  return applyDemoFilters(MOCK_PRODUCTS, { search: q }).slice(0, limit);
}
