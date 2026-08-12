import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

interface OrderRow {
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer_email: string;
  order_items?: {
    title: string;
    price: number;
    quantity: number;
    download_count: number;
    product_id: string | null;
    product?: { category?: { name?: string } } | null;
  }[];
}

const DEMO_ANALYTICS = {
  revenue: { today: 21400, week: 96800, month: 412000, allTime: 5830000 },
  orders_by_status: { pending: 14, processing: 6, completed: 1230, cancelled: 34 },
  top_products: [
    { title: "Kenya KCSE Study Bundle 2024", total_sales: 2688, revenue: 4032000 },
    { title: "Ultimate ChatGPT Prompt Pack 500", total_sales: 2140, revenue: 2568000 },
    { title: "Canva Social Media Mega Pack", total_sales: 1875, revenue: 1668750 },
    { title: "Business Plan Templates Kenya", total_sales: 1345, revenue: 1479500 },
    { title: "Claude AI Prompt Collection", total_sales: 1120, revenue: 1064000 },
  ],
  revenue_by_category: [
    { category: "AI Prompt Packs", revenue: 4100000 },
    { category: "Digital Learning", revenue: 3900000 },
    { category: "Canva Templates", revenue: 2300000 },
    { category: "Business Templates", revenue: 1900000 },
  ],
  new_customers: { month: 86, total: 946 },
  downloads: { total: 52130, month: 3240 },
};

/**
 * GET /api/admin/analytics
 * Revenue breakdowns, order counts, top products, category revenue,
 * customer growth and download totals.
 */
export async function GET() {
  try {
    await requireAdmin();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ data: DEMO_ANALYTICS, demo: true });
    }

    const supabase = createAdminClient();
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(now.getDate() - 30);

    const [ordersRes, productsRes, profilesRes, downloadsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("total, status, payment_status, created_at, customer_email, order_items(title, price, quantity, download_count, product_id, product:products(category:categories(name)))"),
      supabase
        .from("products")
        .select("title, total_sales, price, sale_price, category:categories(name)")
        .order("total_sales", { ascending: false })
        .limit(5),
      supabase.from("profiles").select("created_at", { count: "exact" }),
      supabase.from("download_logs").select("created_at", { count: "exact" }),
    ]);

    const orders = (ordersRes.data ?? []) as unknown as OrderRow[];
    const paid = orders.filter((o) => o.payment_status === "paid");

    const sumSince = (since: Date | null) =>
      paid
        .filter((o) => !since || new Date(o.created_at) >= since)
        .reduce((s, o) => s + Number(o.total), 0);

    const ordersByStatus: Record<string, number> = {};
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    // Revenue by category (from paid order items)
    const byCategory = new Map<string, number>();
    for (const o of paid) {
      for (const item of o.order_items ?? []) {
        const cat = item.product?.category?.name ?? "Other";
        byCategory.set(cat, (byCategory.get(cat) ?? 0) + item.price * item.quantity);
      }
    }

    // Downloads: logged events + item counters
    const itemDownloads = orders.reduce(
      (s, o) => s + (o.order_items ?? []).reduce((x, i) => x + i.download_count, 0),
      0
    );

    const newCustomersMonth = (profilesRes.data ?? []).filter(
      (p) => new Date(p.created_at) >= startOfMonth
    ).length;

    return NextResponse.json({
      data: {
        revenue: {
          today: sumSince(startOfDay),
          week: sumSince(startOfWeek),
          month: sumSince(startOfMonth),
          allTime: sumSince(null),
        },
        orders_by_status: ordersByStatus,
        top_products: (productsRes.data ?? []).map(
          (p: { title: string; total_sales: number; price: number; sale_price: number | null }) => ({
            title: p.title,
            total_sales: p.total_sales,
            revenue: p.total_sales * Number(p.sale_price ?? p.price),
          })
        ),
        revenue_by_category: Array.from(byCategory.entries())
          .map(([category, revenue]) => ({ category, revenue }))
          .sort((a, b) => b.revenue - a.revenue),
        new_customers: {
          month: newCustomersMonth,
          total: profilesRes.count ?? 0,
        },
        downloads: {
          total: itemDownloads,
          month: downloadsRes.count ?? 0,
        },
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
