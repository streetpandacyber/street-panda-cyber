import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { MOCK_REVIEWS } from "@/lib/data/mock";
import { apiError, ApiError } from "@/lib/api/guards";

export const runtime = "nodejs";

interface RouteContext {
  params: { slug: string };
}

/**
 * GET /api/products/[slug]
 * Returns the product with category, reviews (with profiles) and
 * related products. Increments view_count per visit.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product || !product.is_published) {
      throw new ApiError(404, "Product not found");
    }

    // Track the view (fire-and-forget; never blocks the response)
    if (isSupabaseConfigured()) {
      const admin = createAdminClient();
      void (async () => {
        try {
          await admin.rpc("increment_product_views", {
            product_row_id: product.id,
          });
        } catch {
          /* analytics are best-effort */
        }
      })();
    }

    const [related, reviews] = await Promise.all([
      getRelatedProducts(product, 6),
      fetchReviews(product.id),
    ]);

    return NextResponse.json({
      data: { ...product, reviews, related_products: related },
    });
  } catch (err) {
    return apiError(err);
  }
}

async function fetchReviews(productId: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("reviews")
        .select("*, profile:profiles(full_name, avatar_url)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data?.length) return data;
    } catch {
      /* fall through to demo reviews */
    }
  }
  return MOCK_REVIEWS.filter((r) => r.product_id === productId);
}
