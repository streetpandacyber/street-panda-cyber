import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, ApiError, requireUser } from "@/lib/api/guards";

export const runtime = "nodejs";

const schema = z.object({
  product_id: z.string().uuid().or(z.string().min(1)),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

/**
 * POST /api/reviews
 * Requires authentication AND a verified purchase of the product.
 * Recalculates the product's average_rating afterwards.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!isSupabaseConfigured()) {
      throw new ApiError(503, "Supabase is not configured on this deployment");
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const supabase = createAdminClient();

    // Verify the user actually purchased this product
    const { data: purchases } = await supabase
      .from("order_items")
      .select("id, orders!inner(user_id, payment_status)")
      .eq("product_id", data.product_id)
      .eq("orders.user_id", user.id);

    const purchased = ((purchases ?? []) as unknown as Array<{
      orders: { payment_status: string } | Array<{ payment_status: string }>;
    }>).some((p) =>
      Array.isArray(p.orders)
        ? p.orders.some((o) => o.payment_status === "paid")
        : p.orders.payment_status === "paid"
    );
    if (!purchased) {
      throw new ApiError(
        403,
        "You can only review products you have purchased"
      );
    }

    // One review per user per product — update instead of duplicate
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", data.product_id)
      .eq("user_id", user.id)
      .single();

    const reviewPayload = {
      product_id: data.product_id,
      user_id: user.id,
      rating: data.rating,
      title: data.title ?? null,
      comment: data.comment ?? null,
      is_verified: true,
    };

    const { data: review, error } = existing
      ? await supabase
          .from("reviews")
          .update(reviewPayload)
          .eq("id", existing.id)
          .select()
          .single()
      : await supabase.from("reviews").insert(reviewPayload).select().single();

    if (error || !review) {
      throw new ApiError(500, "Could not save your review");
    }

    // Recalculate product rating
    const { data: stats } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", data.product_id);
    if (stats?.length) {
      const avg =
        stats.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
        stats.length;
      await supabase
        .from("products")
        .update({
          average_rating: Math.round(avg * 10) / 10,
          review_count: stats.length,
        })
        .eq("id", data.product_id);
    }

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}
