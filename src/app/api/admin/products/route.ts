import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { MOCK_PRODUCTS } from "@/lib/data/mock";
import {
  apiError,
  paginated,
  parsePagination,
  requireAdmin,
} from "@/lib/api/guards";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

export const runtime = "nodejs";

const createSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).optional(),
  description: z.string().min(1),
  short_description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.number().nonnegative(),
  sale_price: z.number().nonnegative().optional(),
  currency: z.string().default("KES"),
  thumbnail_url: z.string().optional(),
  gallery_urls: z.array(z.string()).optional(),
  preview_urls: z.array(z.string()).optional(),
  file_url: z.string().optional(),
  file_size: z.string().optional(),
  file_format: z.string().optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  what_is_included: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  is_new: z.boolean().default(true),
  is_published: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type AdminFilter = {
  category?: string;
  status?: string; // all | published | draft | featured
  search?: string;
  sort?: string;
};

function demoProducts(filter: AdminFilter, page: number, limit: number) {
  let list = [...MOCK_PRODUCTS] as (Product & { status?: string })[];
  if (filter.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.tags?.some((t) => t.toLowerCase().includes(s))
    );
  }
  if (filter.category) {
    list = list.filter((p) => p.category_id === filter.category);
  }
  if (filter.status === "published") list = list.filter((p) => p.is_published);
  if (filter.status === "draft") list = list.filter((p) => !p.is_published);
  if (filter.status === "featured") list = list.filter((p) => p.is_featured);

  switch (filter.sort) {
    case "oldest":
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "sales":
      list.sort((a, b) => b.total_sales - a.total_sales);
      break;
    default:
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  return {
    items: list.slice((page - 1) * limit, page * limit),
    total: list.length,
  };
}

/**
 * GET /api/admin/products
 * Filters: search, category (id), status (all|published|draft|featured),
 *          sort (newest|oldest|price-desc|price-asc|sales), page, limit
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const sp = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(sp);
    const filter: AdminFilter = {
      category: sp.get("category") ?? undefined,
      status: sp.get("status") ?? undefined,
      search: sp.get("search") ?? undefined,
      sort: sp.get("sort") ?? "newest",
    };

    if (!isSupabaseConfigured()) {
      const { items, total } = demoProducts(filter, page, limit);
      return NextResponse.json(paginated(items, total, page, limit));
    }

    const supabase = createAdminClient();
    let req = supabase
      .from("products")
      .select("*, category:categories(*)", { count: "exact" });

    if (filter.search) {
      req = req.or(`title.ilike.%${filter.search}%,tags.cs.{${filter.search.toLowerCase()}}`);
    }
    if (filter.category) req = req.eq("category_id", filter.category);
    if (filter.status === "published") req = req.eq("is_published", true);
    if (filter.status === "draft") req = req.eq("is_published", false);
    if (filter.status === "featured") req = req.eq("is_featured", true);

    switch (filter.sort) {
      case "oldest":
        req = req.order("created_at", { ascending: true });
        break;
      case "price-desc":
        req = req.order("price", { ascending: false });
        break;
      case "price-asc":
        req = req.order("price", { ascending: true });
        break;
      case "sales":
        req = req.order("total_sales", { ascending: false });
        break;
      default:
        req = req.order("created_at", { ascending: false });
    }

    const { data, error, count } = await req.range(
      (page - 1) * limit,
      page * limit - 1
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(paginated(data ?? [], count ?? 0, page, limit));
  } catch (err) {
    return apiError(err);
  }
}

/** POST /api/admin/products — create a new product (admin only). */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const supabase = createAdminClient();
    let slug = data.slug ?? slugify(data.title);

    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!existing) break;
      slug = `${slugify(data.title)}-${nanoid(4)}`;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({ ...data, slug })
      .select()
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: error?.message ?? "Could not create product" },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}
