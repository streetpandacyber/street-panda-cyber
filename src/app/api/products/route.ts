import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { getProductsPaged, type PagedQuery } from "@/lib/data/service";
import {
  apiError,
  paginated,
  parsePagination,
  PUBLIC_CACHE_HEADERS,
} from "@/lib/api/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fetchPage = cache(async (query: PagedQuery, page: number, limit: number) =>
  getProductsPaged({ ...query, page, limit })
);

/**
 * GET /api/products
 * Query params: category, sort, search, minPrice, maxPrice, tags,
 *               featured, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(sp);

    const query: PagedQuery = {
      categorySlug: sp.get("category") ?? undefined,
      sort: (sp.get("sort") as PagedQuery["sort"]) ?? undefined,
      search: sp.get("search") ?? undefined,
      minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
      maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
      tags: sp.get("tags") ? sp.get("tags")!.split(",").filter(Boolean) : undefined,
      featured: sp.get("featured") === "true" || undefined,
    };

    const { items, total } = await fetchPage(query, page, limit);

    return NextResponse.json(paginated(items, total, page, limit), {
      headers: PUBLIC_CACHE_HEADERS,
    });
  } catch (err) {
    return apiError(err);
  }
}
