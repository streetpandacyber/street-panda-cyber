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
  MOCK_POSTS,
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
    return (data as unknown as (Bundle & { products: { products: Product }[] })[]).map(
      (b) => ({ ...b, products: b.products.map((bp) => bp.products) })
    );
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
  return db ?? MOCK_POSTS;
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
  return db ?? MOCK_POSTS.find((p) => p.slug === slug) ?? null;
}
