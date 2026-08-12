import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  apiError,
  ApiError,
  paginated,
  parsePagination,
  requireAdmin,
} from "@/lib/api/guards";

export const runtime = "nodejs";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "processing", "completed", "cancelled"]).optional(),
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
});

/**
 * GET /api/admin/orders
 * Filters: status, payment_status, search (order number / customer)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const sp = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(sp);

    if (!isSupabaseConfigured()) {
      return NextResponse.json(paginated([], 0, page, limit));
    }

    const supabase = createAdminClient();
    let req = supabase
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (sp.get("status")) req = req.eq("status", sp.get("status")!);
    if (sp.get("payment_status"))
      req = req.eq("payment_status", sp.get("payment_status")!);
    if (sp.get("search")) {
      const s = sp.get("search")!;
      req = req.or(`order_number.ilike.%${s}%,customer_email.ilike.%${s}%,customer_name.ilike.%${s}%`);
    }

    const { data, error, count } = await req.range(
      (page - 1) * limit,
      page * limit - 1
    );
    if (error) throw new ApiError(500, error.message);

    return NextResponse.json(paginated(data ?? [], count ?? 0, page, limit));
  } catch (err) {
    return apiError(err);
  }
}

/** PATCH /api/admin/orders — update order status / payment status. */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { id, ...updates } = parsed.data;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new ApiError(404, "Order not found");
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}
