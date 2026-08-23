import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/api/guards";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, ApiError } from "@/lib/api/guards";

export const runtime = "nodejs";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour

interface RouteContext {
  params: Promise<{ token: string; itemId: string }>;
}

/**
 * GET /api/downloads/[token]/[itemId]
 * Validates the token/item pair, enforces the download limit, generates a
 * 1-hour signed Supabase Storage URL, increments counters and logs the
 * download event.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!isSupabaseConfigured()) {
      throw new ApiError(
        503,
        "Downloads require a configured Supabase project. Add your environment variables."
      );
    }

    const { token, itemId } = await params;
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("download_token", token)
      .single();

    if (error || !order) throw new ApiError(404, "Invalid download link");
    if (order.payment_status !== "paid") {
      throw new ApiError(403, "Order is not paid");
    }
    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      throw new ApiError(410, "This download link has expired. Sign in to request a new one.");
    }

    const item = (order.order_items ?? []).find((i: { id: string }) => i.id === itemId);
    if (!item) throw new ApiError(404, "Item does not belong to this order");

    if (item.download_count >= item.max_downloads) {
      throw new ApiError(
        429,
        "Download limit reached. Contact streetpandacyber@gmail.com if you need more access."
      );
    }

    // Resolve the product's file
    let downloadUrl: string | null = null;
    if (item.product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("file_url, title")
        .eq("id", item.product_id)
        .single();

      if (product?.file_url) {
        if (product.file_url.startsWith("http")) {
          downloadUrl = product.file_url;
        } else {
          // Files live in the private "downloads" bucket (legacy: "products")
          for (const bucket of ["downloads", "products"]) {
            const { data: signed, error: signError } = await supabase.storage
              .from(bucket)
              .createSignedUrl(product.file_url, SIGNED_URL_EXPIRY_SECONDS, {
                download: `${(product.title ?? "download").replace(/[^\w.-]+/g, "-")}`,
              });
            if (!signError && signed?.signedUrl) {
              downloadUrl = signed.signedUrl;
              break;
            }
          }
        }
      }
    }

    if (!downloadUrl) {
      throw new ApiError(404, "File is not available yet. Please contact support.");
    }

    // Claim the slot atomically so concurrent requests cannot exceed the limit.
    const { data: claimedCount, error: claimError } = await supabase.rpc(
      "claim_download",
      { item_row_id: item.id }
    );
    if (claimError) throw claimError;
    if (Number(claimedCount) < 0) {
      throw new ApiError(
        429,
        "Download limit reached. Contact streetpandacyber@gmail.com if you need more access."
      );
    }

    if (item.product_id) {
      try {
        await supabase.rpc("increment_product_downloads", {
          product_row_id: item.product_id,
        });
      } catch {
        /* non-fatal */
      }
    }

    // Log the download event (audit trail)
    const user = await getAuthUser();
    try {
      await supabase.from("download_logs").insert({
        order_id: order.id,
        order_item_id: item.id,
        user_id: user?.id ?? null,
        ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
        user_agent: request.headers.get("user-agent"),
      });
    } catch {
      /* migration 002 not applied yet — logging is best-effort */
    }

    return NextResponse.json({
      download_url: downloadUrl,
      expires_in_seconds: SIGNED_URL_EXPIRY_SECONDS,
    });
  } catch (err) {
    return apiError(err);
  }
}
