import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, ApiError, requireUser } from "@/lib/api/guards";

export const runtime = "nodejs";

const postSchema = z.object({ product_id: z.string().min(1) });

/** GET /api/wishlist — the authenticated user's wishlist (with products). */
export async function GET() {
  try {
    const user = await requireUser();
    if (!isSupabaseConfigured()) {
      throw new ApiError(503, "Supabase is not configured on this deployment");
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("wishlist")
      .select("product_id, created_at, products(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "Could not load wishlist");
    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    return apiError(err);
  }
}

/** POST /api/wishlist — add a product to the wishlist. */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!isSupabaseConfigured()) {
      throw new ApiError(503, "Supabase is not configured on this deployment");
    }
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("wishlist")
      .upsert(
        { user_id: user.id, product_id: parsed.data.product_id },
        { onConflict: "user_id,product_id" }
      );
    if (error) throw new ApiError(500, "Could not save to wishlist");
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}

/** DELETE /api/wishlist?product_id=… — remove a product from the wishlist. */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!isSupabaseConfigured()) {
      throw new ApiError(503, "Supabase is not configured on this deployment");
    }
    const productId = request.nextUrl.searchParams.get("product_id");
    if (!productId) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) throw new ApiError(500, "Could not remove from wishlist");
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
