import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().min(2),
  subtotal: z.number().nonnegative().default(0),
});

/** Demo coupons used when the database is not configured yet. */
const DEMO_COUPONS = [
  {
    code: "WELCOME20",
    discount_type: "percentage" as const,
    discount_value: 20,
    minimum_order: 0,
    maximum_discount: 1000,
  },
  {
    code: "NEWUSER",
    discount_type: "fixed" as const,
    discount_value: 100,
    minimum_order: 500,
    maximum_discount: undefined as number | undefined,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const code = parsed.data.code.toUpperCase();
    const subtotal = parsed.data.subtotal;

    let coupon: {
      code: string;
      discount_type: "percentage" | "fixed";
      discount_value: number;
      minimum_order: number;
      maximum_discount?: number;
      usage_limit?: number;
      usage_count?: number;
      expires_at?: string;
    } | null = null;

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
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

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This coupon has expired" },
        { status: 400 }
      );
    }

    if (
      coupon.usage_limit !== undefined &&
      coupon.usage_limit !== null &&
      (coupon.usage_count ?? 0) >= coupon.usage_limit
    ) {
      return NextResponse.json(
        { valid: false, error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    if (subtotal < (coupon.minimum_order ?? 0)) {
      return NextResponse.json(
        {
          valid: false,
          error: `This coupon needs a minimum order of KES ${coupon.minimum_order}`,
        },
        { status: 400 }
      );
    }

    let discount =
      coupon.discount_type === "percentage"
        ? Math.round((subtotal * coupon.discount_value) / 100)
        : coupon.discount_value;
    if (coupon.maximum_discount) {
      discount = Math.min(discount, coupon.maximum_discount);
    }
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount,
      discount_type: coupon.discount_type,
      message: `Coupon applied — you save KES ${discount}`,
    });
  } catch (err) {
    console.error("[coupons:validate] error", err);
    return NextResponse.json(
      { error: "Could not validate coupon" },
      { status: 500 }
    );
  }
}
