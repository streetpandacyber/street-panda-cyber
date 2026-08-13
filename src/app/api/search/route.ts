import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/service";
import { apiError, PUBLIC_CACHE_HEADERS } from "@/lib/api/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=term
 * Fast top-10 search across title, description and tags.
 */
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";
    if (!q.trim()) {
      return NextResponse.json({ data: [] });
    }
    const results = await searchProducts(q, 10);
    return NextResponse.json(
      {
        data: results.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: p.sale_price ?? p.price,
          original_price: p.sale_price !== undefined ? p.price : undefined,
          thumbnail_url: p.thumbnail_url ?? null,
          category: p.category?.name ?? null,
          average_rating: p.average_rating ?? null,
        })),
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (err) {
    return apiError(err);
  }
}
