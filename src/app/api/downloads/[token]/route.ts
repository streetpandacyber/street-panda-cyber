import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, ApiError } from "@/lib/api/guards";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/downloads/[token]
 * Validates the order's download token and returns the list of
 * downloadable items (with remaining download counts).
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSupabaseConfigured()) {
      throw new ApiError(503, "Supabase is not configured on this deployment");
    }

    const { token } = await params;
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, created_at, payment_status, download_expires_at, order_items(*, product:products(title, thumbnail_url, file_format, file_size))"
      )
      .eq("download_token", token)
      .single();

    if (error || !order) throw new ApiError(404, "Invalid download link");
    if (order.payment_status !== "paid") {
      throw new ApiError(403, "This order has not been paid for");
    }
    if (
      order.download_expires_at &&
      new Date(order.download_expires_at) < new Date()
    ) {
      throw new ApiError(410, "This download link has expired");
    }

    return NextResponse.json({
      data: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        order_date: order.created_at,
        expires_at: order.download_expires_at,
        items: (order.order_items ?? []).map(
          (i: {
            id: string;
            title: string;
            product_id: string | null;
            download_count: number;
            max_downloads: number;
            product?: {
              title?: string;
              thumbnail_url?: string;
              file_format?: string;
              file_size?: string;
            } | null;
          }) => ({
            id: i.id,
            title: i.title,
            product_id: i.product_id,
            downloads_used: i.download_count,
            downloads_remaining: Math.max(0, i.max_downloads - i.download_count),
            url: `/api/downloads/${token}/${i.id}`,
            product: i.product ?? null,
          })
        ),
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
