"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Download,
  Heart,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatDate, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export default function DashboardPage() {
  const { configured, loading, user, profile, orders, ordersLoading } =
    useDashboard();
  const wishlistCount = useWishlistStore((s) => s.items.length);

  if (loading || ordersLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="animate-pulse text-3xl">⏳</span>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="card-premium p-10 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-orange-500" />
        <h1 className="mt-4 text-xl font-bold text-navy-800">
          Connect Supabase to unlock your dashboard
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Add your Supabase URL and keys to the environment variables to enable
          accounts, orders and downloads. Meanwhile, enjoy browsing the store!
        </p>
        <Link href="/marketplace" className="btn-primary mt-6">
          <ShoppingBag className="h-4 w-4" /> Browse Marketplace
        </Link>
      </div>
    );
  }

  if (!user) return null; // redirecting to login

  const totalDownloads = (orders ?? []).reduce(
    (sum, o) => sum + (o.order_items?.length ?? 0),
    0
  );
  const name = profile?.full_name || user.email?.split("@")[0] || "there";
  const profileComplete = Boolean(profile?.full_name && profile?.phone);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">
        Welcome back, <span className="text-gradient-orange">{name}</span> 👋
      </h1>
      <p className="mt-1 text-gray-500">
        Here&apos;s everything happening in your account.
      </p>

      {!profileComplete && (
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-5 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-orange-800">
            📝 Complete your profile to speed up checkout and support.
          </p>
          <Link href="/dashboard/profile" className="btn-primary !px-4 !py-2 text-sm">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          {
            label: "Total Orders",
            value: orders.length,
            icon: Package,
            color: "bg-navy-50 text-navy-600",
          },
          {
            label: "Total Downloads",
            value: totalDownloads,
            icon: Download,
            color: "bg-neon-50 text-neon-600",
          },
          {
            label: "Wishlist Items",
            value: wishlistCount,
            icon: Heart,
            color: "bg-orange-50 text-orange-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-premium flex items-center gap-4 p-6">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-navy-800">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="card-premium mt-8 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-bold text-navy-800">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No orders yet — your first purchase is one click away! 🚀
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-t border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-bold text-navy-800">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-navy-800">
                      {formatPrice(order.total, order.currency)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">M-Pesa</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.payment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick access */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link href="/dashboard/downloads" className="card-premium flex items-center gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-50 text-2xl">
            ⚡
          </span>
          <div>
            <p className="font-bold text-navy-800">My Downloads</p>
            <p className="text-sm text-gray-500">
              Re-download any product you&apos;ve purchased
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-gray-300" />
        </Link>
        <Link href="/dashboard/wishlist" className="card-premium flex items-center gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
            ❤️
          </span>
          <div>
            <p className="font-bold text-navy-800">My Wishlist</p>
            <p className="text-sm text-gray-500">
              Products you&apos;ve saved for later
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-gray-300" />
        </Link>
      </div>
    </div>
  );
}
