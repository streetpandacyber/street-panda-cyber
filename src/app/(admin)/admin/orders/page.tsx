"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  CreditCard,
  KeyRound,
  Search,
  X,
  XCircle,
} from "lucide-react";
import type { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, PageHeader, StatusPill, inputCls, selectCls } from "@/components/admin/ui";

const STATUS_LIST = ["pending", "processing", "completed", "cancelled"];

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders?limit=100");
      const data = await res.json();
      setOrders(data.data ?? []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // deep-link from dashboard: /admin/orders?order=<id>
  useEffect(() => {
    const id = searchParams.get("order");
    if (id && !detail) {
      fetch(`/api/orders/${id}`)
        .then((r) => r.json())
        .then((d) => d.data && setDetail(d.data))
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filtered = orders.filter((o) => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !o.order_number.toLowerCase().includes(s) &&
        !o.customer_email.toLowerCase().includes(s)
      )
        return false;
    }
    if (status && o.status !== status) return false;
    if (payment && o.payment_status !== payment) return false;
    if (from && new Date(o.created_at) < new Date(from)) return false;
    if (to && new Date(o.created_at) > new Date(`${to}T23:59:59`)) return false;
    return true;
  });

  const counts = STATUS_LIST.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const act = async (order: Order, action: "completed" | "refund" | "cancel") => {
    setActing(true);
    const updates =
      action === "completed"
        ? { status: "completed" }
        : action === "refund"
          ? { payment_status: "refunded", status: "cancelled" }
          : { status: "cancelled", payment_status: "failed" };
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, ...updates }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(
        action === "completed"
          ? `Order ${order.order_number} completed ✅`
          : action === "refund"
            ? `Order ${order.order_number} refunded`
            : `Order ${order.order_number} cancelled`
      );
      setDetail(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  };

  const maskToken = (t?: string) =>
    t ? `${t.slice(0, 4)}••••••••••••${t.slice(-4)}` : "—";

  const timelineStep = (o: Order) =>
    o.status === "completed" ? 3 : o.status === "processing" ? 2 : o.status === "cancelled" ? 0 : 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Track, process and manage every sale" />

      {/* stats row */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATUS_LIST.map((s) => (
          <Card key={s} className="!p-4">
            <p className="text-2xl font-extrabold text-white">{counts[s] ?? 0}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              {s}
            </p>
          </Card>
        ))}
      </div>

      {/* filters */}
      <Card className="!p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_150px_150px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order # or customer email…"
              className={inputCls + " !pl-10"}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="" className="bg-navy-900">All Status</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s} className="bg-navy-900">{s}</option>
            ))}
          </select>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className={selectCls}>
            <option value="" className="bg-navy-900">All Payments</option>
            {["paid", "pending", "failed", "refunded"].map((s) => (
              <option key={s} value={s} className="bg-navy-900">{s}</option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} aria-label="From date" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} aria-label="To date" />
        </div>
      </Card>

      {/* table */}
      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-4 font-semibold">Order #</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Items</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Payment</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-white/40">Loading orders…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-white/40">No orders match your filters.</td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5">
                      <button onClick={() => setDetail(o)} className="font-bold text-white underline-offset-4 hover:text-orange-300 hover:underline">
                        {o.order_number}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-white/80">{o.customer_name}</p>
                      <p className="text-xs text-white/40">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{o.order_items?.length ?? 0}</td>
                    <td className="px-5 py-3.5 font-semibold text-white">{formatPrice(Number(o.total))}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-white/60">
                        <CreditCard className="h-3.5 w-3.5 text-neon-300" /> M-Pesa
                      </span>
                      {o.mpesa_transaction_id && (
                        <p className="text-[10px] text-white/30">{o.mpesa_transaction_id}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><StatusPill status={o.status} /></td>
                    <td className="px-5 py-3.5 text-white/50">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setDetail(o)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-navy-900 p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">{detail.order_number}</h2>
                <p className="mt-1 text-xs text-white/40">{formatDate(detail.created_at)}</p>
              </div>
              <button onClick={() => setDetail(null)} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* timeline */}
            <div className="mt-6 flex items-center">
              {["Created", "Processing", "Completed"].map((label, i) => {
                const step = timelineStep(detail);
                const done = step >= i + 1;
                const cancelled = detail.status === "cancelled";
                return (
                  <div key={label} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${cancelled && i > 0 ? "bg-red-500/20 text-red-300" : done ? "bg-neon-500 text-white" : "bg-white/10 text-white/40"}`}>
                        {cancelled && i > 0 ? <XCircle className="h-4 w-4" /> : done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </span>
                      <span className="mt-1 text-[10px] font-bold text-white/50">{label}</span>
                    </div>
                    {i < 2 && <div className={`mx-2 mb-4 h-0.5 flex-1 ${done && step >= i + 2 ? "bg-neon-500" : "bg-white/10"}`} />}
                  </div>
                );
              })}
            </div>

            {/* customer */}
            <div className="mt-6 grid gap-4 rounded-2xl bg-white/5 p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">Customer</p>
                <p className="mt-1 font-semibold text-white">{detail.customer_name}</p>
                <p className="text-white/50">{detail.customer_email}</p>
                {detail.customer_phone && <p className="text-white/50">{detail.customer_phone}</p>}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">Payment</p>
                <p className="mt-1 flex items-center gap-1.5 text-white/70"><CreditCard className="h-3.5 w-3.5 text-neon-300" /> M-Pesa • <StatusPill status={detail.payment_status} /></p>
                <p className="mt-1 text-white/50">Txn: {detail.mpesa_transaction_id ?? "—"}</p>
                <p className="mt-1 flex items-center gap-1.5 text-white/50"><KeyRound className="h-3.5 w-3.5" /> Token: {maskToken(detail.download_token)}</p>
              </div>
            </div>

            {/* items */}
            <div className="mt-4 rounded-2xl bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">Products ordered</p>
              <ul className="mt-3 space-y-2 text-sm">
                {(detail.order_items ?? []).map((i) => (
                  <li key={i.id} className="flex justify-between text-white/70">
                    <span>{i.quantity}× {i.title}</span>
                    <span className="font-semibold text-white">{formatPrice(Number(i.price))}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-white/10 pt-2 font-extrabold text-white">
                  <span>Total</span>
                  <span>{formatPrice(Number(detail.total))}</span>
                </li>
              </ul>
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {detail.status !== "completed" && detail.payment_status === "paid" && (
                <button disabled={acting} onClick={() => act(detail, "completed")} className="btn-primary !py-2.5 text-sm">
                  Mark as Completed
                </button>
              )}
              {detail.payment_status === "paid" && (
                <button disabled={acting} onClick={() => act(detail, "refund")} className="rounded-xl bg-yellow-500/20 px-5 py-2.5 text-sm font-bold text-yellow-300 hover:bg-yellow-500/30">
                  Refund
                </button>
              )}
              {detail.status !== "cancelled" && (
                <button disabled={acting} onClick={() => act(detail, "cancel")} className="rounded-xl bg-red-500/20 px-5 py-2.5 text-sm font-bold text-red-300 hover:bg-red-500/30">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white/40">Loading…</div>}>
      <OrdersContent />
    </Suspense>
  );
}
