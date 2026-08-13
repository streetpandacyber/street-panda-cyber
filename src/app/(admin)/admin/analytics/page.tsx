"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, ShoppingBag, Users, Wallet } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { formatPrice } from "@/lib/utils";
import { Card, DeltaBadge, PageHeader } from "@/components/admin/ui";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: 365 },
];

const PIE_COLORS = ["#f97316", "#39d353", "#3b82f6", "#a855f7", "#eab308", "#ef4444"];
const k = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

const tooltipStyle = {
  background: "#0a1240",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 12,
};

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { analytics, fetchAnalytics } = useAdmin();

  useEffect(() => {
    fetchAnalytics().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => d.data && setLocal(d.data))
      .catch(() => undefined);
  }, [days]);

  const [local, setLocal] = useState<typeof analytics>(null);
  const a = local ?? analytics;

  if (!a) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const metrics = [
    { label: "Revenue", value: formatPrice(a.revenue.total), delta: a.revenue.changePct, icon: Wallet, color: "text-neon-300 bg-neon-500/15" },
    { label: "Orders", value: a.orders.total.toLocaleString(), delta: a.orders.changePct, icon: ShoppingBag, color: "text-orange-300 bg-orange-500/15" },
    { label: "New Customers", value: a.customers.new.toLocaleString(), delta: a.customers.changePct, icon: Users, color: "text-blue-300 bg-blue-500/15" },
    { label: "Downloads", value: a.downloads.total.toLocaleString(), delta: a.downloads.changePct, icon: Download, color: "text-violet-300 bg-violet-500/15" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        subtitle={`Performance for ${a.range.from} → ${a.range.to}`}
        action={
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  days === r.days ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* metrics row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <DeltaBadge pct={m.delta} />
              </div>
              <p className="mt-4 text-2xl font-extrabold text-white">{m.value}</p>
              <p className="text-xs text-white/40">{m.label} vs previous period</p>
            </Card>
          );
        })}
      </div>

      {/* charts grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-white">Revenue trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.revenueSeries}>
                <defs>
                  <linearGradient id="anRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d: string) => d.slice(5)} interval={Math.ceil(a.revenueSeries.length / 7)} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => k(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatPrice(Number(v)), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#anRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-white">Orders by day</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.ordersSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d: string) => d.slice(5)} interval={Math.ceil(a.ordersSeries.length / 7)} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-white">Top products by revenue</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.topProducts} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.07)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => k(v)} />
                <YAxis type="category" dataKey="title" width={150} stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatPrice(Number(v)), "Revenue"]} />
                <Bar dataKey="revenue" fill="#39d353" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <h2 className="text-lg font-bold text-white">Revenue by category</h2>
            <div className="mt-2 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={a.revenueByCategory} dataKey="revenue" nameKey="category" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {a.revenueByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatPrice(Number(v))]} />
                  <Legend formatter={(v) => <span className="text-[11px] text-white/60">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-white">Customer growth</h2>
            <div className="mt-2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={a.customerGrowthSeries}>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d: string) => d.slice(5)} interval={Math.ceil(a.customerGrowthSeries.length / 6)} />
                  <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} domain={["dataMin", "dataMax"]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="total" stroke="#a855f7" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* best performers table */}
      <Card className="!p-0">
        <h2 className="p-6 pb-0 text-lg font-bold text-white">Best performing products</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-y border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold">Views</th>
                <th className="px-6 py-3 font-semibold">Sales</th>
                <th className="px-6 py-3 font-semibold">Revenue</th>
                <th className="px-6 py-3 font-semibold">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {a.topProducts.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        {p.thumbnail_url && (
                          <Image src={p.thumbnail_url} alt={p.title} fill sizes="36px" className="object-cover" />
                        )}
                      </div>
                      <span className="line-clamp-1 font-semibold text-white/80">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-white/60">{p.views.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-white/60">{p.sales.toLocaleString()}</td>
                  <td className="px-6 py-3.5 font-semibold text-white">{formatPrice(p.revenue)}</td>
                  <td className="px-6 py-3.5">
                    <span className="rounded-full bg-neon-500/15 px-2.5 py-1 text-xs font-bold text-neon-300">
                      {p.conversion}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
