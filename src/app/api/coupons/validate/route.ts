import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError } from "@/lib/api/guards";

export const runtime = "nodejs";

const schema = z
  .object({
    code: z.string().min(2),
    cartTotal: z.number().nonnegative().optional(),
    subtotal: z.number().nonnegative().optional(),
  })
  .transform((v) => ({
    code: v.code,
    cartTotal: v.cartTotal ?? v.subtotal ?? 0,
  }));

/** Demo coupons used when the database is not configured yet. */
const DEMO_COUPONS = [
  {
    code: "WELCOME20",
    discount_type: "percentage" as const,
    discount_value: 20,
    minimum_order: 0,
    maximum_discount: 1000,
    usage_limit: null as number | null,
    usage_count: 0,
    expires_at: null as string | null,
    is_active: true,
  },
  {
    code: "NEWUSER",
    discount_type: "fixed" as const,
    discount_value: 100,
    minimum_order: 500,
    maximum_discount: null as number | null,
    usage_limit: null as number | null,
    usage_count: 0,
    expires_at: null as string | null,
    is_active: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: "Invalid request — provide code and cartTotal" },
        { status: 400 }
      );
    }
    const code = parsed.data.code.toUpperCase();
    const cartTotal = parsed.data.cartTotal;

    let coupon: (typeof DEMO_COUPONS)[number] | null = null;

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .single();
      coupon = data;
    } else {
      coupon = DEMO_COUPONS.find((c) => c.code === code) ?? null;
    }

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Coupon not found or inactive" },
        { status: 404 }
      );
    }
    if (!coupon.is_active) {
      return NextResponse.json(
        { valid: false, error: "This coupon is not active" },
        { status: 400 }
      );
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This coupon has expired" },
        { status: 400 }
      );
    }
    if (
      coupon.usage_limit !== null &&
      coupon.usage_limit !== undefined &&
      coupon.usage_count >= coupon.usage_limit
    ) {
      return NextResponse.json(
        { valid: false, error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }
    if (cartTotal < (coupon.minimum_order ?? 0)) {
      return NextResponse.json(
        {
          valid: false,
          error: `This coupon needs a minimum order of KES ${coupon.minimum_order}`,
        },
        { status: 400 }
      );
    }

    let amount =
      coupon.discount_type === "percentage"
        ? Math.round((cartTotal * coupon.discount_value) / 100)
        : coupon.discount_value;
    if (coupon.maximum_discount) amount = Math.min(amount, coupon.maximum_discount);
    amount = Math.min(amount, cartTotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: amount,
      // backwards-compatible aliases used by the existing cart UI
      discount: amount,
      discount_type: coupon.discount_type,
      message: `Coupon applied — you save KES ${amount}`,
    });
  } catch (err) {
    return apiError(err);
  }
}
