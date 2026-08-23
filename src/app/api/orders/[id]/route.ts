import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, ApiError, requireUser } from "@/lib/api/guards";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 * Protected — the caller must own the order (or be an admin via RLS profile).
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*), profile:profiles(full_name, is_admin)")
      .eq("id", id)
      .single();

    if (error || !order) throw new ApiError(404, "Order not found");

    const isAdmin = Boolean((order as { profile?: { is_admin?: boolean } }).profile?.is_admin);
    if (order.user_id !== user.id && !isAdmin) {
      throw new ApiError(403, "You do not have access to this order");
    }

    const safeOrder = { ...(order as Record<string, unknown>) };
    delete safeOrder.profile;
    return NextResponse.json({ data: safeOrder });
  } catch (err) {
    return apiError(err);
  }
}
