import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductsPaged } from "@/lib/data/service";
import {
  apiError,
  paginated,
  parsePagination,
  requireAdmin,
} from "@/lib/api/guards";
import { slugify } from "@/lib/utils";

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

/** GET /api/admin/products — all products with filters + pagination. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const sp = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(sp);

    const result = await getProductsPaged({
      categorySlug: sp.get("category") ?? undefined,
      search: sp.get("search") ?? undefined,
      sort: (sp.get("sort") as "newest" | "popular") ?? "newest",
      page,
      limit,
    });

    // Admin view includes unpublished products too when Supabase is live
    return NextResponse.json(paginated(result.items, result.total, page, limit));
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

    // Ensure slug uniqueness
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
