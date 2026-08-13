import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, ApiError, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/admin/customers/[id]
 * Full profile + order history + downloads accessed.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single();
    if (error || !profile) throw new ApiError(404, "Customer not found");

    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number, total, status, payment_status, created_at, order_items(title, price, quantity, download_count)")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false });

    const orderList = orders ?? [];
    const downloadsAccessed = orderList.reduce(
      (sum, o) =>
        sum +
        (o.order_items ?? []).reduce(
          (s, i: { download_count: number }) => s + i.download_count,
          0
        ),
      0
    );

    return NextResponse.json({
      data: {
        profile,
        orders: orderList,
        stats: {
          total_orders: orderList.length,
          total_spent: orderList
            .filter((o) => o.payment_status === "paid")
            .reduce((s, o) => s + Number(o.total), 0),
          downloads_accessed: downloadsAccessed,
        },
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
