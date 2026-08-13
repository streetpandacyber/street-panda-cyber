import { NextResponse } from "next/server";
import { getCategoriesWithCounts } from "@/lib/data/service";
import { apiError, PUBLIC_CACHE_HEADERS } from "@/lib/api/guards";

export const runtime = "nodejs";

/** GET /api/categories — all categories with live product counts. */
export async function GET() {
  try {
    const categories = await getCategoriesWithCounts();
    return NextResponse.json({ data: categories }, {
      headers: PUBLIC_CACHE_HEADERS,
    });
  } catch (err) {
    return apiError(err);
  }
}
