import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, ApiError } from "@/lib/api/guards";

export const runtime = "nodejs";

const itemSchema = z
  .object({
    product_id: z.string().min(1).optional(),
    bundle_id: z.string().min(1).optional(),
    title: z.string().trim().min(1).max(200),
    price: z.number().finite().nonnegative(),
    quantity: z.number().int().positive().max(20).default(1),
  })
  .refine((item) => Boolean(item.product_id) !== Boolean(item.bundle_id), {
    message: "Each item must reference exactly one product or bundle",
  });

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(320),
  customer_phone: z.string().trim().max(32).optional(),
  coupon_code: z.string().trim().max(64).optional(),
  items: z.array(itemSchema).min(1).max(100),
});

type OrderItemInput = z.infer<typeof itemSchema>;

type ResolvedOrderItem = {
  product_id?: string;
  bundle_id?: string;
  title: string;
  price: number;
  quantity: number;
};

async function resolveOrderItems(
  supabase: ReturnType<typeof createAdminClient>,
  items: OrderItemInput[]
): Promise<ResolvedOrderItem[]> {
  const productIds = items
    .map((item) => item.product_id)
    .filter((id): id is string => Boolean(id));
  const bundleIds = items
    .map((item) => item.bundle_id)
    .filter((id): id is string => Boolean(id));

  const [productsResult, bundlesResult] = await Promise.all([
    productIds.length
      ? supabase
          .from("products")
          .select("id, title, price, sale_price, currency, is_published")
          .in("id", productIds)
          .eq("is_published", true)
      : Promise.resolve({ data: [], error: null }),
    bundleIds.length
      ? supabase
          .from("bundles")
          .select("id, title, bundle_price, currency, is_published")
          .in("id", bundleIds)
          .eq("is_published", true)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (productsResult.error || bundlesResult.error) {
    throw new ApiError(503, "Catalog pricing is temporarily unavailable");
  }

  const products = new Map(
    (productsResult.data ?? []).map((product) => [product.id, product])
  );
  const bundles = new Map(
    (bundlesResult.data ?? []).map((bundle) => [bundle.id, bundle])
  );

  return items.map((item) => {
    if (item.product_id) {
      const product = products.get(item.product_id);
      if (!product) {
        throw new ApiError(400, "One or more products are unavailable");
      }
      const price = Number(product.sale_price ?? product.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new ApiError(503, "Catalog pricing is temporarily unavailable");
      }
      return {
        product_id: product.id,
        title: product.title,
        price,
        quantity: item.quantity,
      };
    }

    const bundle = item.bundle_id ? bundles.get(item.bundle_id) : undefined;
    if (!bundle) {
      throw new ApiError(400, "One or more bundles are unavailable");
    }
    const price = Number(bundle.bundle_price);
    if (!Number.isFinite(price) || price < 0) {
      throw new ApiError(503, "Catalog pricing is temporarily unavailable");
    }
    return {
      bundle_id: bundle.id,
      title: bundle.title,
      price,
      quantity: item.quantity,
    };
  });
}

function demoOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JMM-${ymd}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Demo mode: no Supabase configured — return a mock order so the
    // checkout UX can be exercised end to end.
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        demo: true,
        id: nanoid(),
        order_number: demoOrderNumber(),
        subtotal,
        discount: 0,
        total: subtotal,
        currency: "KES",
        payment_status: "pending",
      });
    }

    const supabase = createAdminClient();
    const resolvedItems = await resolveOrderItems(supabase, data.items);
    const authoritativeSubtotal = resolvedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Optional coupon
    let discount = 0;
    let couponId: string | undefined;
    if (data.coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", data.coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();
      if (coupon && authoritativeSubtotal >= (coupon.minimum_order ?? 0)) {
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          /* expired — ignore */
        } else {
          discount =
            coupon.discount_type === "percentage"
              ? Math.round((subtotal * coupon.discount_value) / 100)
              : coupon.discount_value;
          if (coupon.maximum_discount) {
            discount = Math.min(discount, coupon.maximum_discount);
          }
          couponId = coupon.id;
        }
      }
    }

    const total = Math.max(0, authoritativeSubtotal - discount);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone ?? null,
        subtotal: authoritativeSubtotal,
        discount,
        total,
        currency: "KES",
        payment_method: "mpesa",
        payment_status: "pending",
        status: "pending",
        coupon_id: couponId ?? null,
      })
      .select("*, order_items(*)")
      .single();

    if (orderError || !order) {
      console.error("[orders] create failed", orderError);
      return NextResponse.json(
        { error: "Could not create order. Please try again." },
        { status: 500 }
      );
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      resolvedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id ?? null,
        bundle_id: item.bundle_id ?? null,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }))
    );

    if (itemsError) {
      console.error("[orders] items insert failed", itemsError);
    }

    if (couponId) {
      const { data: couponRow } = await supabase
        .from("coupons")
        .select("usage_count")
        .eq("id", couponId)
        .single();
      await supabase
        .from("coupons")
        .update({ usage_count: (couponRow?.usage_count ?? 0) + 1 })
        .eq("id", couponId);
    }

    // Optional order webhook notification (fire-and-forget)
    const webhookUrl = process.env.ORDER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order.created",
          order_id: order.id,
          order_number: order.order_number,
          total,
          currency: "KES",
          customer_email: data.customer_email,
          items: resolvedItems,
          created_at: new Date().toISOString(),
        }),
      }).catch((e) => console.warn("[orders] webhook failed", e));
    }

    return NextResponse.json({
      id: order.id,
      order_number: order.order_number,
      subtotal,
      discount,
      total,
      currency: "KES",
      payment_status: "pending",
    });
  } catch (err) {
    return apiError(err);
  }
}
