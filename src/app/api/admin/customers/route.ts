import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import {
  apiError,
  paginated,
  parsePagination,
  requireAdmin,
} from "@/lib/api/guards";

export const runtime = "nodejs";

/**
 * GET /api/admin/customers
 * Profiles enriched with order counts and lifetime spend.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const sp = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(sp);
    const search = sp.get("search") ?? "";

    if (!isSupabaseConfigured()) {
      const demo = [
        { id: "u1", email: "sarah@example.com", full_name: "Sarah Mwangi", avatar_url: null, phone: "0712 000 111", created_at: "2026-03-14T09:00:00Z", total_orders: 6, total_spent: 8450 },
        { id: "u2", email: "james@example.com", full_name: "James Kiptoo", avatar_url: null, phone: "0722 000 222", created_at: "2026-04-02T09:00:00Z", total_orders: 4, total_spent: 6300 },
        { id: "u3", email: "faith@example.com", full_name: "Faith Wanjiru", avatar_url: null, phone: "0733 000 333", created_at: "2026-05-21T09:00:00Z", total_orders: 3, total_spent: 4150 },
        { id: "u4", email: "brian@example.com", full_name: "Brian Odhiambo", avatar_url: null, phone: null, created_at: "2026-06-30T09:00:00Z", total_orders: 2, total_spent: 2090 },
      ];
      return NextResponse.json(paginated(demo, demo.length, page, limit));
    }

    const supabase = createAdminClient();
    const [profilesRes, ordersRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, phone, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, total, payment_status"),
    ]);

    const profiles = (profilesRes.data ?? []) as {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
      phone: string | null;
      created_at: string;
    }[];

    const byUser = new Map<string, { orders: number; spent: number }>();
    for (const o of (ordersRes.data ?? []) as {
      user_id: string | null;
      total: number;
      payment_status: string;
    }[]) {
      if (!o.user_id) continue;
      const agg = byUser.get(o.user_id) ?? { orders: 0, spent: 0 };
      agg.orders += 1;
      if (o.payment_status === "paid") agg.spent += Number(o.total);
      byUser.set(o.user_id, agg);
    }

    let rows = profiles.map((p) => ({
      ...p,
      total_orders: byUser.get(p.id)?.orders ?? 0,
      total_spent: byUser.get(p.id)?.spent ?? 0,
    }));

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.email.toLowerCase().includes(s) ||
          (r.full_name ?? "").toLowerCase().includes(s)
      );
    }

    const paged = rows.slice((page - 1) * limit, page * limit);
    return NextResponse.json(paginated(paged, rows.length, page, limit));
  } catch (err) {
    return apiError(err);
  }
}
