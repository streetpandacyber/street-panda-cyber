import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, ApiError, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

const couponSchema = z.object({
  code: z.string().min(2).max(30),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]).default("percentage"),
  discount_value: z.number().positive(),
  minimum_order: z.number().nonnegative().default(0),
  maximum_discount: z.number().positive().optional(),
  usage_limit: z.number().int().positive().optional(),
  is_active: z.boolean().default(true),
  expires_at: z.string().optional(),
});

const DEMO_COUPONS = [
  { id: "c1", code: "WELCOME20", description: "Welcome offer", discount_type: "percentage", discount_value: 20, minimum_order: 0, maximum_discount: 1000, usage_limit: 5000, usage_count: 1284, is_active: true, expires_at: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "c2", code: "NEWUSER", description: "New customer gift", discount_type: "fixed", discount_value: 100, minimum_order: 500, maximum_discount: null, usage_limit: 3000, usage_count: 862, is_active: true, expires_at: "2026-12-31T00:00:00Z", created_at: "2026-01-01T00:00:00Z" },
  { id: "c3", code: "STUDENT15", description: "Student discount", discount_type: "percentage", discount_value: 15, minimum_order: 1000, maximum_discount: null, usage_limit: null, usage_count: 214, is_active: false, expires_at: "2026-06-30T00:00:00Z", created_at: "2026-02-01T00:00:00Z" },
];

/** GET /api/admin/coupons — list all coupons. */
export async function GET() {
  try {
    const { demo } = await requireAdmin();
    if (demo) return NextResponse.json({ data: DEMO_COUPONS });
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, error.message);
    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    return apiError(err);
  }
}

/** POST /api/admin/coupons — create a coupon. */
export async function POST(request: NextRequest) {
  try {
    const { demo } = await requireAdmin();
    const parsed = couponSchema.safeParse(await request.json());
    if (demo && parsed.success) {
      return NextResponse.json({ data: { id: "demo", ...parsed.data } }, { status: 201 });
    }
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid coupon payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const supabase = createAdminClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert({ ...data, code: data.code.toUpperCase() })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: error.code === "23505" ? "Coupon code already exists" : error.message },
        { status: 409 }
      );
    }
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}

/** PUT /api/admin/coupons?id=… — update a coupon. */
export async function PUT(request: NextRequest) {
  try {
    const { demo } = await requireAdmin();
    if (demo) return NextResponse.json({ data: { id: "demo" } });
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const body = await request.json();
    const parsed = couponSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("coupons")
      .update({ ...parsed.data, ...(parsed.data.code ? { code: parsed.data.code.toUpperCase() } : {}) })
      .eq("id", id)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Coupon not found");
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}

/** DELETE /api/admin/coupons?id=… — delete a coupon. */
export async function DELETE(request: NextRequest) {
  try {
    const { demo } = await requireAdmin();
    if (demo) return NextResponse.json({ success: true });
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = createAdminClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw new ApiError(500, error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
