import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, ApiError } from "@/lib/api/guards";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]/status
 * Lightweight polling endpoint used while waiting for M-Pesa confirmation.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        payment_status: "pending",
        status: "pending",
        demo: true,
      });
    }

    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, payment_status, status, mpesa_transaction_id, download_token")
      .eq("id", id)
      .single();

    if (error || !data) throw new ApiError(404, "Order not found");

    return NextResponse.json({
      order_number: data.order_number,
      payment_status: data.payment_status,
      status: data.status,
      mpesa_transaction_id: data.mpesa_transaction_id ?? null,
      download_token: data.payment_status === "paid" ? data.download_token : null,
    });
  } catch (err) {
    return apiError(err);
  }
}
