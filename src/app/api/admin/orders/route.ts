import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  apiError,
  ApiError,
  paginated,
  parsePagination,
  requireAdmin,
} from "@/lib/api/guards";

export const runtime = "nodejs";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "processing", "completed", "cancelled"]).optional(),
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
});

/**
 * GET /api/admin/orders
 * Filters: status, payment_status, search (order number / customer)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const sp = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(sp);

    if (!isSupabaseConfigured()) {
      const now = Date.now();
      const demo = [
        { id: "d1", order_number: "JMM-20260812-0142", customer_name: "Sarah Mwangi", customer_email: "sarah@example.com", total: 1800, status: "completed", payment_status: "paid", mpesa_transaction_id: "QK7T9GH2L1", created_at: new Date(now - 2 * 3600e3).toISOString(), order_items: [{ id: "i1", title: "Creator Starter Bundle", price: 1800, quantity: 1 }] },
        { id: "d2", order_number: "JMM-20260812-0141", customer_name: "James Kiptoo", customer_email: "james@example.com", total: 3200, status: "completed", payment_status: "paid", mpesa_transaction_id: "PL2M8VV5D9", created_at: new Date(now - 5 * 3600e3).toISOString(), order_items: [{ id: "i2", title: "Ultimate Business Bundle", price: 3200, quantity: 1 }] },
        { id: "d3", order_number: "JMM-20260812-0140", customer_name: "Faith Wanjiru", customer_email: "faith@example.com", total: 1500, status: "pending", payment_status: "pending", mpesa_transaction_id: null, created_at: new Date(now - 9 * 3600e3).toISOString(), order_items: [{ id: "i3", title: "Kenya KCSE Study Bundle 2024", price: 1500, quantity: 1 }] },
        { id: "d4", order_number: "JMM-20260811-0139", customer_name: "Brian Odhiambo", customer_email: "brian@example.com", total: 2650, status: "processing", payment_status: "paid", mpesa_transaction_id: "XN4B2QW8R6", created_at: new Date(now - 26 * 3600e3).toISOString(), order_items: [{ id: "i4", title: "ChatGPT Prompt Pack 500", price: 1200, quantity: 1 }, { id: "i5", title: "Gemini Prompt Pack Pro", price: 750, quantity: 1 }, { id: "i6", title: "The AI Side Hustle Playbook", price: 650, quantity: 1 }] },
        { id: "d5", order_number: "JMM-20260811-0138", customer_name: "Grace Njeri", customer_email: "grace@example.com", total: 890, status: "cancelled", payment_status: "failed", mpesa_transaction_id: null, created_at: new Date(now - 30 * 3600e3).toISOString(), order_items: [{ id: "i7", title: "Canva Social Media Mega Pack", price: 890, quantity: 1 }] },
      ];
      return NextResponse.json(paginated(demo, demo.length, page, limit));
    }

    const supabase = createAdminClient();
    let req = supabase
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (sp.get("status")) req = req.eq("status", sp.get("status")!);
    if (sp.get("payment_status"))
      req = req.eq("payment_status", sp.get("payment_status")!);
    if (sp.get("search")) {
      const s = sp.get("search")!;
      req = req.or(`order_number.ilike.%${s}%,customer_email.ilike.%${s}%,customer_name.ilike.%${s}%`);
    }

    const { data, error, count } = await req.range(
      (page - 1) * limit,
      page * limit - 1
    );
    if (error) throw new ApiError(500, error.message);

    return NextResponse.json(paginated(data ?? [], count ?? 0, page, limit));
  } catch (err) {
    return apiError(err);
  }
}

/** PATCH /api/admin/orders — update order status / payment status. */
export async function PATCH(request: NextRequest) {
  try {
    const { demo } = await requireAdmin();
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    if (demo) {
      return NextResponse.json({ data: parsed.data });
    }
    const { id, ...updates } = parsed.data;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) throw new ApiError(404, "Order not found");
    return NextResponse.json({ data });
  } catch (err) {
    return apiError(err);
  }
}
