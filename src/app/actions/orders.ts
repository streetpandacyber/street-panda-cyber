"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

type ActionResult = { error?: string; data?: unknown };

export interface CartItemInput {
  product_id?: string;
  bundle_id?: string;
  title: string;
  price: number;
  quantity: number;
}

export async function createOrderAction(
  cartItems: CartItemInput[],
  customerData: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    coupon_code?: string;
  }
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured on this deployment." };
  }
  if (!cartItems.length) return { error: "Your cart is empty." };

  const supabase = createAdminClient();

  // Attach the signed-in user when present
  let userId: string | null = null;
  try {
    const browser = await createClient();
    const { data } = await browser.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  let discount = 0;
  let couponId: string | null = null;
  if (customerData.coupon_code) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", customerData.coupon_code.toUpperCase())
      .eq("is_active", true)
      .single();
    if (coupon && subtotal >= (coupon.minimum_order ?? 0)) {
      discount =
        coupon.discount_type === "percentage"
          ? Math.round((subtotal * coupon.discount_value) / 100)
          : coupon.discount_value;
      if (coupon.maximum_discount) discount = Math.min(discount, coupon.maximum_discount);
      couponId = coupon.id;
    }
  }

  const total = Math.max(0, subtotal - discount);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_name: customerData.customer_name,
      customer_email: customerData.customer_email,
      customer_phone: customerData.customer_phone ?? null,
      subtotal,
      discount,
      total,
      currency: "KES",
      payment_method: "mpesa",
      payment_status: "pending",
      status: "pending",
      coupon_id: couponId,
    })
    .select()
    .single();

  if (error || !order) {
    return { error: error?.message ?? "Could not create the order." };
  }

  await supabase.from("order_items").insert(
    cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id ?? null,
      bundle_id: item.bundle_id ?? null,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
    }))
  );

  return { data: order };
}

export async function cancelOrderAction(orderId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured on this deployment." };
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, payment_status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found." };

  // Only the owner (or unpaid orders) may cancel
  let userId: string | null = null;
  try {
    const browser = await createClient();
    const { data } = await browser.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }
  if (order.user_id !== userId) return { error: "You cannot cancel this order." };
  if (order.payment_status === "paid") {
    return { error: "Paid orders cannot be cancelled — request a refund instead." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { error: error.message };
  return { data: { cancelled: true } };
}
