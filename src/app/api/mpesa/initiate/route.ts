import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stkPush } from "@/lib/mpesa/daraja";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMpesaConfigured, isSupabaseConfigured } from "@/lib/env";
import { isValidPhone } from "@/lib/utils";

export const runtime = "nodejs";

const schema = z.object({
  order_id: z.string().min(1),
  phone: z.string().min(9),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "order_id and phone are required" },
        { status: 400 }
      );
    }
    const { order_id, phone } = parsed.data;

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Enter a valid Kenyan phone number (07XX… or +2547XX…)" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !isMpesaConfigured()) {
      return NextResponse.json(
        {
          error:
            "Payments are not configured. Add Supabase and M-Pesa Daraja environment variables.",
        },
        { status: 503 }
      );
    }

    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_status")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 409 }
      );
    }

    const result = await stkPush({
      phone,
      amount: order.total,
      orderId: order.id,
      description: `JMM Order ${order.order_number}`,
    });

    if (result.errorCode || result.ErrorMessage) {
      console.error("[mpesa:initiate] STK push failed", result);
      return NextResponse.json(
        {
          success: false,
          error: result.errorMessage ?? result.ErrorMessage ?? "STK push failed",
        },
        { status: 502 }
      );
    }

    await supabase
      .from("orders")
      .update({
        checkout_request_id: result.CheckoutRequestID,
        mpesa_phone: phone,
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      checkout_request_id: result.CheckoutRequestID,
      merchant_request_id: result.MerchantRequestID,
      message: result.CustomerMessage ?? "Check your phone for the M-Pesa prompt",
    });
  } catch (err) {
    console.error("[mpesa:initiate] unexpected error", err);
    return NextResponse.json(
      { error: "Could not start M-Pesa payment. Please try again." },
      { status: 500 }
    );
  }
}
