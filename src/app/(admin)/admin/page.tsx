"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  DollarSign,
  Package,
  PlusCircle,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, DeltaBadge, PageHeader, StatusPill } from "@/components/admin/ui";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  pending: "#eab308",
  cancelled: "#ef4444",
  processing: "#3b82f6",
};

const k = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

const tooltipStyle = {
  background: "#0a1240",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 12,
};

function Sparkline({ data, dataKey, color }: { data: { [key: string]: unknown }[]; dataKey: string; color: string }) {
  return (
    <div className="h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.slice(-14)}>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.15} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminDashboard() {
  const { analytics, loadingAnalytics, updateOrderStatus } = useAdmin();
  const [productStats, setProductStats] = useState({ total: 0, featured: 0, published: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [all, featured, published] = await Promise.all([
          fetch("/api/admin/products?limit=1").then((r) => r.json()),
          fetch("/api/admin/products?status=featured&limit=1").then((r) => r.json()),
          fetch("/api/admin/products?status=published&limit=1").then((r) => r.json()),
        ]);
        setProductStats({
          total: all.pagination?.total ?? 0,
          featured: featured.pagination?.total ?? 0,
          published: published.pagination?.total ?? 0,
        });
      } catch {
        /* demo fallback below */
      }
    })();
  }, []);

  if (loadingAnalytics && !analytics) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Loading store performance…" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const a = analytics;
  const revenueSeries = a?.revenueSeries ?? [];
  const ordersSeries = a?.ordersSeries ?? [];
  const growthSeries = a?.customerGrowthSeries ?? [];
  const byStatus = a?.orders.byStatus ?? {};
  const donutData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Your store at a glance — this month"
        action={
          <Link href="/admin/products/new" className="btn-primary shrink-0">
            <PlusCircle className="h-4 w-4" /> Add Product
          </Link>
        }
      />

      {/* ROW 1 — metric cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Revenue */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-500/15 text-neon-300">
              <DollarSign className="h-5 w-5" />
            </span>
            {a && <DeltaBadge pct={a.revenue.changePct} />}
          </div>
          <p className="mt-4 text-2xl font-extrabold text-white">
            {formatPrice(a?.revenue.total ?? 0)}
          </p>
          <p className="text-xs text-white/40">Revenue this month</p>
          <Sparkline data={revenueSeries} dataKey="revenue" color="#39d353" />
        </Card>

        {/* Orders */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
              <ShoppingBag className="h-5 w-5" />
            </span>
            {a && <DeltaBadge pct={a.orders.changePct} />}
          </div>
          <p className="mt-4 text-2xl font-extrabold text-white">
            {(a?.orders.total ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-white/40">
            Orders this month •{" "}
            <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 font-bold text-yellow-300">
              {byStatus.pending ?? 0} pending
            </span>
          </p>
          <Sparkline data={ordersSeries} dataKey="orders" color="#f97316" />
        </Card>

        {/* Customers */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <Users className="h-5 w-5" />
            </span>
            {a && <DeltaBadge pct={a.customers.changePct} />}
          </div>
          <p className="mt-4 text-2xl font-extrabold text-white">
            {(a?.customers.total ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-white/40">
            Customers • <span className="font-bold text-neon-300">+{a?.customers.new ?? 0} new</span> this month
          </p>
          <Sparkline data={growthSeries} dataKey="total" color="#3b82f6" />
        </Card>

        {/* Products */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <Package className="h-5 w-5" />
            </span>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200"
            >
              Add New <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-white">
            {productStats.total || 12}
            <span className="ml-2 text-sm font-semibold text-white/40">published</span>
          </p>
          <p className="text-xs text-white/40">
            ⭐ {productStats.featured || 4} featured •{" "}
            <Link href="/admin/products" className="font-bold text-orange-300 hover:text-orange-200">
              manage →
            </Link>
          </p>
          <div className="mt-3 h-10" />
        </Card>
      </div>

      {/* ROW 2 — charts */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <h2 className="text-lg font-bold text-white">Revenue — last 30 days</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev30" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.35)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval={4}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.35)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `KES ${k(v)}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(d) => `📅 ${d}`}
                  formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#rev30)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-white">Orders by status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs capitalize text-white/60">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ROW 3 — tables */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent orders */}
        <Card className="!p-0">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-lg font-bold text-white">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-orange-300 hover:text-orange-200">
              View all →
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-y border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-6 py-3 font-semibold">Order #</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Items</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(a?.recentOrders ?? []).slice(0, 10).map((o) => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-3.5 font-bold text-white">{o.order_number}</td>
                    <td className="px-6 py-3.5 text-white/70">{o.customer_name}</td>
                    <td className="px-6 py-3.5 text-white/50">{o.items_count}</td>
                    <td className="px-6 py-3.5 font-semibold text-white">{formatPrice(o.total)}</td>
                    <td className="px-6 py-3.5"><StatusPill status={o.status} /></td>
                    <td className="px-6 py-3.5 text-white/50">{formatDate(o.created_at)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex gap-1">
                        <Link
                          href={`/admin/orders?order=${o.id}`}
                          className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                          title="View"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        {o.status !== "completed" && o.payment_status === "paid" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, { status: "completed" })}
                            className="rounded-lg p-1.5 text-white/40 hover:bg-neon-500/20 hover:text-neon-300"
                            title="Mark completed"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top products */}
        <Card className="!p-0">
          <h2 className="p-6 pb-0 text-lg font-bold text-white">Top products</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-y border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-3 py-3 font-semibold">Sales</th>
                <th className="px-3 py-3 font-semibold">Revenue</th>
                <th className="px-3 py-3 font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {(a?.topProducts ?? []).map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        {p.thumbnail_url && (
                          <Image src={p.thumbnail_url} alt={p.title} fill sizes="36px" className="object-cover" />
                        )}
                      </div>
                      <span className="line-clamp-1 font-semibold text-white/80">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-white/60">{p.sales.toLocaleString()}</td>
                  <td className="px-3 py-3 font-semibold text-white">{formatPrice(p.revenue)}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1 text-yellow-300">
                      <Star className="h-3.5 w-3.5 fill-current" /> {p.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

