import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { apiError, requireAdmin } from "@/lib/api/guards";

export const runtime = "nodejs";

/* ── types ─────────────────────────────────────────── */

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  mpesa_transaction_id: string | null;
  download_token: string | null;
  created_at: string;
  order_items?: {
    title: string;
    price: number;
    quantity: number;
    download_count: number;
    product_id: string | null;
    product?: { category?: { name?: string } | null } | null;
  }[];
}

const DAY = 24 * 60 * 60 * 1000;

const dayKey = (d: Date | string) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
};

function buildSeries(from: Date, to: Date) {
  const out: string[] = [];
  for (let t = from.getTime(); t <= to.getTime(); t += DAY) {
    out.push(dayKey(new Date(t)));
  }
  return out;
}

/* ── demo data (deterministic) ─────────────────────── */

function demoAnalytics(days: number) {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * DAY);
  const series = buildSeries(from, to);
  const wave = (i: number, base: number, amp: number) =>
    Math.round(base + amp * Math.sin(i / 3.1) + amp * 0.6 * Math.sin(i / 1.7));

  const revenueSeries = series.map((date, i) => ({
    date,
    revenue: wave(i, 14000, 7000) + i * 120,
  }));
  const ordersSeries = series.map((date, i) => ({
    date,
    orders: Math.max(2, Math.round(wave(i, 14, 8) / 1000) + Math.round(wave(i, 12, 6) / 1000)),
  }));
  const growthSeries = series.map((date, i) => ({
    date,
    total: 700 + i * 8 + Math.round(3 * Math.sin(i / 4)),
  }));

  const totalRevenue = revenueSeries.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = ordersSeries.reduce((s, o) => s + o.orders, 0);

  return {
    range: { days, from: dayKey(from), to: dayKey(to) },
    revenue: { total: totalRevenue, previous: Math.round(totalRevenue * 0.86), changePct: 16.3 },
    orders: {
      total: totalOrders,
      previous: Math.round(totalOrders * 0.9),
      changePct: 11.1,
      byStatus: { completed: Math.round(totalOrders * 0.82), pending: 14, processing: 6, cancelled: 9 },
    },
    customers: { total: 946, new: 86, previousNew: 71, changePct: 21.1 },
    downloads: { total: 3240 + days * 40, previous: 2900 + days * 35, changePct: 12.4 },
    revenueSeries,
    ordersSeries,
    customerGrowthSeries: growthSeries,
    topProducts: [
      { id: "p-03", title: "Kenya KCSE Study Bundle 2024", thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=200&q=60", sales: 2688, revenue: 4032000, rating: 4.9, views: 22110, conversion: 12.2 },
      { id: "p-01", title: "Ultimate ChatGPT Prompt Pack 500", thumbnail_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=200&q=60", sales: 2140, revenue: 2568000, rating: 4.9, views: 18930, conversion: 11.3 },
      { id: "p-02", title: "Canva Social Media Mega Pack", thumbnail_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=200&q=60", sales: 1875, revenue: 1668750, rating: 4.8, views: 15200, conversion: 12.3 },
      { id: "p-05", title: "Business Plan Templates Kenya", thumbnail_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=200&q=60", sales: 1345, revenue: 1479500, rating: 4.7, views: 11020, conversion: 12.2 },
      { id: "p-04", title: "Claude AI Prompt Collection", thumbnail_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=200&q=60", sales: 1120, revenue: 1064000, rating: 4.8, views: 9840, conversion: 11.4 },
    ],
    revenueByCategory: [
      { category: "AI Prompt Packs", revenue: 4100000 },
      { category: "Digital Learning", revenue: 3900000 },
      { category: "Canva Templates", revenue: 2300000 },
      { category: "Business Templates", revenue: 1900000 },
      { category: "Social Media Packs", revenue: 900000 },
    ],
    recentOrders: [
      { id: "d1", order_number: "JMM-20260811-0142", customer_name: "Sarah Mwangi", customer_email: "sarah@example.com", items_count: 2, total: 1800, status: "completed", payment_status: "paid", mpesa_transaction_id: "QK7T9GH2L1", created_at: new Date(to.getTime() - 2 * 3600e3).toISOString() },
      { id: "d2", order_number: "JMM-20260811-0141", customer_name: "James Kiptoo", customer_email: "james@example.com", items_count: 1, total: 3200, status: "completed", payment_status: "paid", mpesa_transaction_id: "PL2M8VV5D9", created_at: new Date(to.getTime() - 5 * 3600e3).toISOString() },
      { id: "d3", order_number: "JMM-20260811-0140", customer_name: "Faith Wanjiru", customer_email: "faith@example.com", items_count: 1, total: 1500, status: "pending", payment_status: "pending", mpesa_transaction_id: null, created_at: new Date(to.getTime() - 9 * 3600e3).toISOString() },
      { id: "d4", order_number: "JMM-20260810-0139", customer_name: "Brian Odhiambo", customer_email: "brian@example.com", items_count: 3, total: 2650, status: "processing", payment_status: "paid", mpesa_transaction_id: "XN4B2QW8R6", created_at: new Date(to.getTime() - 26 * 3600e3).toISOString() },
      { id: "d5", order_number: "JMM-20260810-0138", customer_name: "Grace Njeri", customer_email: "grace@example.com", items_count: 1, total: 890, status: "cancelled", payment_status: "failed", mpesa_transaction_id: null, created_at: new Date(to.getTime() - 30 * 3600e3).toISOString() },
    ],
  };
}

/* ── handler ───────────────────────────────────────── */

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const daysParam = Number(request.nextUrl.searchParams.get("days") ?? 30);
    const days = [7, 30, 90, 365].includes(daysParam) ? daysParam : 30;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ data: demoAnalytics(days), demo: true });
    }

    const supabase = createAdminClient();
    const now = new Date();
    const from = new Date(now.getTime() - (days - 1) * DAY);
    const prevFrom = new Date(from.getTime() - days * DAY);
    const prevTo = new Date(from.getTime() - 1);

    const [ordersRes, prevOrdersRes, productsRes, profilesRes, downloadsRes, prevDownloadsRes] =
      await Promise.all([
        supabase
          .from("orders")
          .select("id, order_number, customer_name, customer_email, total, status, payment_status, mpesa_transaction_id, download_token, created_at, order_items(title, price, quantity, download_count, product_id, product:products(category:categories(name)))")
          .gte("created_at", prevFrom.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("total, payment_status, created_at")
          .gte("created_at", prevFrom.toISOString())
          .lte("created_at", prevTo.toISOString()),
        supabase
          .from("products")
          .select("id, title, thumbnail_url, total_sales, price, sale_price, average_rating, view_count, is_published, is_featured")
          .order("total_sales", { ascending: false }),
        supabase.from("profiles").select("created_at", { count: "exact" }),
        supabase
          .from("download_logs")
          .select("created_at")
          .gte("created_at", from.toISOString()),
        supabase
          .from("download_logs")
          .select("created_at")
          .gte("created_at", prevFrom.toISOString())
          .lte("created_at", prevTo.toISOString()),
      ]);

    const allOrders = (ordersRes.data ?? []) as unknown as OrderRow[];
    const orders = allOrders.filter((o) => new Date(o.created_at) >= from);
    const prevOrders = (prevOrdersRes.data ?? []) as unknown as {
      total: number;
      payment_status: string;
    }[];

    const paid = orders.filter((o) => o.payment_status === "paid");
    const prevPaid = prevOrders.filter((o) => o.payment_status === "paid");
    const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
    const prevRevenue = prevPaid.reduce((s, o) => s + Number(o.total), 0);
    const pct = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : 0;

    const series = buildSeries(from, now);
    const revenueByDay = new Map(series.map((d) => [d, 0]));
    const ordersByDay = new Map(series.map((d) => [d, 0]));
    for (const o of orders) {
      const k = dayKey(o.created_at);
      ordersByDay.set(k, (ordersByDay.get(k) ?? 0) + 1);
      if (o.payment_status === "paid") {
        revenueByDay.set(k, (revenueByDay.get(k) ?? 0) + Number(o.total));
      }
    }

    const byStatus: Record<string, number> = {};
    for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

    const revenueByCategory = new Map<string, number>();
    for (const o of paid) {
      for (const item of o.order_items ?? []) {
        const cat = item.product?.category?.name ?? "Other";
        revenueByCategory.set(cat, (revenueByCategory.get(cat) ?? 0) + item.price * item.quantity);
      }
    }

    const newCustomers = (profilesRes.data ?? []).filter(
      (p) => new Date(p.created_at) >= from
    ).length;
    const prevNewCustomers = (profilesRes.data ?? []).filter(
      (p) => {
        const d = new Date(p.created_at);
        return d >= prevFrom && d <= prevTo;
      }
    ).length;

    // cumulative customer growth across the range
    const createdSorted = (profilesRes.data ?? [])
      .map((p) => new Date(p.created_at).getTime())
      .filter((t) => t <= now.getTime())
      .sort((a, b) => a - b);
    let running = createdSorted.filter((t) => t < from.getTime()).length;
    let cursor = 0;
    const customerGrowthSeries = series.map((date) => {
      const end = new Date(date).getTime() + DAY;
      while (cursor < createdSorted.length && createdSorted[cursor] < end) {
        running += 1;
        cursor += 1;
      }
      return { date, total: running };
    });

    const top = (productsRes.data ?? []).slice(0, 5).map(
      (p: {
        id: string;
        title: string;
        thumbnail_url: string | null;
        total_sales: number;
        price: number;
        sale_price: number | null;
        average_rating: number | null;
        view_count: number;
      }) => ({
        id: p.id,
        title: p.title,
        thumbnail_url: p.thumbnail_url,
        sales: p.total_sales,
        revenue: p.total_sales * Number(p.sale_price ?? p.price),
        rating: p.average_rating ?? 0,
        views: p.view_count,
        conversion:
          p.view_count > 0
            ? Math.round((p.total_sales / p.view_count) * 1000) / 10
            : 0,
      })
    );

    const downloadsTotal = downloadsRes.count ?? 0;
    const downloadsPrev = prevDownloadsRes.count ?? 0;

    return NextResponse.json({
      data: {
        range: { days, from: dayKey(from), to: dayKey(now) },
        revenue: { total: revenue, previous: prevRevenue, changePct: pct(revenue, prevRevenue) },
        orders: {
          total: orders.length,
          previous: prevOrders.length,
          changePct: pct(orders.length, prevOrders.length),
          byStatus,
        },
        customers: {
          total: profilesRes.count ?? 0,
          new: newCustomers,
          previousNew: prevNewCustomers,
          changePct: pct(newCustomers, prevNewCustomers),
        },
        downloads: {
          total: downloadsTotal,
          previous: downloadsPrev,
          changePct: pct(downloadsTotal, downloadsPrev),
        },
        revenueSeries: series.map((date) => ({
          date,
          revenue: revenueByDay.get(date) ?? 0,
        })),
        ordersSeries: series.map((date) => ({
          date,
          orders: ordersByDay.get(date) ?? 0,
        })),
        customerGrowthSeries,
        topProducts: top,
        revenueByCategory: Array.from(revenueByCategory.entries())
          .map(([category, rev]) => ({ category, revenue: rev }))
          .sort((a, b) => b.revenue - a.revenue),
        recentOrders: orders.slice(0, 10).map((o) => ({
          id: o.id,
          order_number: o.order_number,
          customer_name: o.customer_name,
          customer_email: o.customer_email,
          items_count: o.order_items?.length ?? 0,
          total: Number(o.total),
          status: o.status,
          payment_status: o.payment_status,
          mpesa_transaction_id: o.mpesa_transaction_id,
          created_at: o.created_at,
        })),
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
