"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";

export default function OrdersPage() {
  const { configured, loading, user, orders, ordersLoading } = useDashboard();

  if (loading || ordersLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="animate-pulse text-3xl">⏳</span>
      </div>
    );
  }

  if (!configured || !user) {
    return (
      <div className="card-premium p-10 text-center text-sm text-gray-500">
        Sign in with a configured account to see your orders.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">
        My Orders
      </h1>
      <p className="mt-1 text-gray-500">
        {orders.length} order{orders.length === 1 ? "" : "s"} placed
      </p>

      {orders.length === 0 ? (
        <div className="card-premium mt-8 flex flex-col items-center gap-4 p-14 text-center">
          <span className="text-5xl">📦</span>
          <h2 className="text-lg font-bold text-navy-800">No orders yet</h2>
          <p className="max-w-sm text-sm text-gray-500">
            When you buy a product it shows up here with receipts and download
            links.
          </p>
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="card-premium mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-bold text-navy-800">
                      {order.order_number}
                      {order.mpesa_transaction_id && (
                        <p className="text-xs font-normal text-gray-400">
                          M-Pesa: {order.mpesa_transaction_id}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.order_items?.length ?? 0}
                    </td>
                    <td className="px-6 py-4 font-semibold text-navy-800">
                      {formatPrice(order.total, order.currency)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">M-Pesa</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={order.payment_status} />
                        <StatusBadge status={order.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
