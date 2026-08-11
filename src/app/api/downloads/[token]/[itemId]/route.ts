import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: { token: string; itemId: string };
}

/**
 * Secure download gateway.
 * Validates the order's download token + expiry + remaining downloads,
 * then returns a signed Supabase Storage URL (or redirects for external
 * file URLs) and increments the item's download counter.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token, itemId } = params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Downloads require a configured Supabase project. Add your environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("download_token", token)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Invalid download link" }, { status: 404 });
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json({ error: "Order is not paid" }, { status: 403 });
    }

    if (
      order.download_expires_at &&
      new Date(order.download_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: "This download link has expired. Sign in to request a new one." },
        { status: 410 }
      );
    }

    const item = (order.order_items ?? []).find(
      (i: { id: string }) => i.id === itemId
    );
    if (!item) {
      return NextResponse.json({ error: "Item not found in this order" }, { status: 404 });
    }

    if (item.download_count >= item.max_downloads) {
      return NextResponse.json(
        {
          error:
            "Download limit reached. Contact streetpandacyber@gmail.com if you need more access.",
        },
        { status: 429 }
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
          const { data: signed, error: signError } = await supabase.storage
            .from("products")
            .createSignedUrl(product.file_url, 60 * 30, {
              download: `${(product.title ?? "download").replace(/[^\w.-]+/g, "-")}`,
            });
          if (!signError && signed?.signedUrl) {
            downloadUrl = signed.signedUrl;
          }
        }
      }
    }

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "File is not available yet. Please contact support." },
        { status: 404 }
      );
    }

    // Increment download counters
    await supabase
      .from("order_items")
      .update({ download_count: item.download_count + 1 })
      .eq("id", item.id);
    if (item.product_id) {
      try {
        await supabase.rpc("increment_product_downloads", {
          product_row_id: item.product_id,
        });
      } catch (e) {
        console.warn("[downloads] rpc", e);
      }
    }

    return NextResponse.json({ download_url: downloadUrl });
  } catch (err) {
    console.error("[downloads] error", err);
    return NextResponse.json(
      { error: "Could not generate download link" },
      { status: 500 }
    );
  }
}
