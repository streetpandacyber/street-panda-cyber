import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { OrderConfirmation } from "../../../../../emails/OrderConfirmation";
import { APP_URL } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Safaricom M-Pesa STK Push callback.
 * Always returns 200 to acknowledge receipt, per Daraja requirements.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const callback = payload?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (!isCallbackConfigured()) {
      console.info("[mpesa:callback] Supabase not configured — ignoring", callback);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const supabase = createAdminClient();
    const merchantRequestID: string = callback.MerchantRequestID;
    const resultCode: number = callback.ResultCode;

    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("checkout_request_id", merchantRequestID)
      .single();

    if (!order) {
      console.warn(
        "[mpesa:callback] no order for checkout request",
        merchantRequestID
      );
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      // ── Payment successful ────────────────────────────────
      const metadata: Array<{ Name: string; Value?: string }> =
        callback.CallbackMetadata?.Item ?? [];
      const receipt =
        metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value ?? "";

      const downloadToken = nanoid(32);
      const expiresAt = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "completed",
          mpesa_transaction_id: receipt,
          download_token: downloadToken,
          download_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Increment product sales counters
      for (const item of order.order_items ?? []) {
        if (item.product_id) {
          try {
            await supabase.rpc("increment_product_sales", {
              product_row_id: item.product_id,
            });
          } catch (e) {
            console.warn("[mpesa:callback] rpc", e);
          }
        }
      }

      // Send confirmation email (non-blocking failure)
      try {
        await sendEmail({
          to: order.customer_email,
          subject: `Order Confirmed — ${order.order_number} | JM Majiwa`,
          react: OrderConfirmation({
            customerName: order.customer_name,
            orderNumber: order.order_number,
            orderDate: order.created_at,
            items: (order.order_items ?? []).map((i: { title: string; price: number }) => ({
              title: i.title,
              price: i.price,
            })),
            total: order.total,
            downloadUrl: `${APP_URL}/downloads/${downloadToken}`,
          }),
        });
      } catch (emailErr) {
        console.error("[mpesa:callback] email failed", emailErr);
      }

      console.log(
        `[mpesa:callback] ✅ order ${order.order_number} paid — receipt ${receipt}, token issued, email queued to ${order.customer_email}`
      );
    } else {
      // ── Payment failed / cancelled by user ───────────────
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("[mpesa:callback] unexpected error", err);
    // Always ACK Safaricom to prevent retries storms
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}

function isCallbackConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.startsWith("https://") && url.includes("supabase");
}
