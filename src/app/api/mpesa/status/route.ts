import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Polling endpoint used by the checkout page to detect when the
 * M-Pesa payment completes.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    return NextResponse.json({ error: "order_id is required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      payment_status: "pending",
      status: "pending",
      demo: true,
    });
  }

  try {
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, payment_status, status, mpesa_transaction_id")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      order_number: order.order_number,
      payment_status: order.payment_status,
      status: order.status,
      mpesa_transaction_id: order.mpesa_transaction_id ?? null,
    });
  } catch (err) {
    console.error("[mpesa:status] error", err);
    return NextResponse.json(
      { error: "Could not fetch payment status" },
      { status: 500 }
    );
  }
}
