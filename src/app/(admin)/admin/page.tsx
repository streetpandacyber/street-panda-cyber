"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Order } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const DEMO_REVENUE = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 6800 },
  { day: "Wed", revenue: 5400 },
  { day: "Thu", revenue: 9200 },
  { day: "Fri", revenue: 12800 },
  { day: "Sat", revenue: 15400 },
  { day: "Sun", revenue: 8600 },
];

const DEMO_ORDERS: Partial<Order>[] = [
  {
    id: "d1",
    order_number: "JMM-20260811-0142",
    customer_name: "Sarah Mwangi",
    total: 1800,
    currency: "KES",
    payment_status: "paid",
    status: "completed",
    created_at: "2026-08-11T09:24:00.000Z",
  },
  {
    id: "d2",
    order_number: "JMM-20260811-0141",
    customer_name: "James Kiptoo",
    total: 3200,
    currency: "KES",
    payment_status: "paid",
    status: "completed",
    created_at: "2026-08-11T08:02:00.000Z",
  },
  {
    id: "d3",
    order_number: "JMM-20260811-0140",
    customer_name: "Faith Wanjiru",
    total: 1500,
    currency: "KES",
    payment_status: "pending",
    status: "pending",
    created_at: "2026-08-11T07:41:00.000Z",
  },
  {
    id: "d4",
    order_number: "JMM-20260810-0139",
    customer_name: "Brian Odhiambo",
    total: 890,
    currency: "KES",
    payment_status: "paid",
    status: "completed",
    created_at: "2026-08-10T16:12:00.000Z",
  },
];

export default function AdminDashboard() {
  const configured = isSupabaseConfigured();
  const [stats, setStats] = useState({
    revenueToday: 21400,
    totalOrders: 1284,
    totalCustomers: 946,
    totalProducts: 128,
  });
  const [orders, setOrders] = useState<Partial<Order>[]>(DEMO_ORDERS);
  const [revenue, setRevenue] = useState(DEMO_REVENUE);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    (async () => {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id", { count: "exact", head: true }),
        ]);
        const liveOrders = (ordersRes.data ?? []) as unknown as Order[];
        if (liveOrders.length > 0) {
          const today = new Date().toDateString();
          setStats({
            revenueToday: liveOrders
              .filter(
                (o) =>
                  o.payment_status === "paid" &&
                  new Date(o.created_at).toDateString() === today
              )
              .reduce((sum, o) => sum + o.total, 0),
            totalOrders: liveOrders.length,
            totalCustomers: customersRes.count ?? 0,
            totalProducts: productsRes.count ?? 0,
          });
          setOrders(liveOrders.slice(0, 6));
        }
      } catch {
        /* keep demo data */
      }
    })();
  }, [configured]);

  const statCards = [
    {
      label: "Revenue Today",
      value: formatPrice(stats.revenueToday),
      icon: DollarSign,
      color: "bg-neon-500/20 text-neon-300",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "bg-orange-500/20 text-orange-300",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: "bg-blue-500/20 text-blue-300",
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "bg-violet-500/20 text-violet-300",
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white md:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {configured
              ? "Live data from your Supabase project."
              : "Showing demo data — connect Supabase for live stats."}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary shrink-0">
          <PlusCircle className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.color}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-sm text-white/50">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue chart */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <BarChart3 className="h-5 w-5 text-orange-400" /> Revenue — Last 7
            Days
          </h2>
          <span className="badge bg-neon-500/20 text-neon-300">
            <ArrowUpRight className="h-3 w-3" /> +18% vs last week
          </span>
        </div>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="rgba(255,255,255,0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#0a1240",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#fff",
                }}
                formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <h2 className="p-6 pb-0 text-lg font-bold text-white">Recent Orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-6 py-3 font-semibold">Order</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 font-bold text-white">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 text-white/70">{order.customer_name}</td>
                  <td className="px-6 py-4 text-white/50">
                    {order.created_at ? formatDate(order.created_at) : "—"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {formatPrice(order.total ?? 0, order.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.payment_status ?? "pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          {
            title: "Add a Product",
            desc: "Publish a new digital product in minutes.",
            href: "/admin/products/new",
            emoji: "🚀",
          },
          {
            title: "Manage Products",
            desc: "Edit pricing, status and featured flags.",
            href: "/admin/products",
            emoji: "📦",
          },
          {
            title: "View Storefront",
            desc: "See exactly what your customers see.",
            href: "/",
            emoji: "🛍️",
          },
        ].map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-orange-400/40"
          >
            <span className="text-3xl">{a.emoji}</span>
            <p className="mt-3 font-bold text-white">{a.title}</p>
            <p className="mt-1 text-sm text-white/50">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
