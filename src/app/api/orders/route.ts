import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

const itemSchema = z.object({
  product_id: z.string().optional(),
  bundle_id: z.string().optional(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().default(1),
});

const orderSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().optional(),
  coupon_code: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

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
      if (coupon && subtotal >= (coupon.minimum_order ?? 0)) {
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

    const total = Math.max(0, subtotal - discount);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone ?? null,
        subtotal,
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
      data.items.map((item) => ({
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
    console.error("[orders] unexpected error", err);
    return NextResponse.json(
      { error: "Something went wrong creating the order." },
      { status: 500 }
    );
  }
}
