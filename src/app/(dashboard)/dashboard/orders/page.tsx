"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronDown,
  Download,
  FileDown,
  MessageSquarePlus,
  ShoppingBag,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ItemRow {
  id: string;
  title: string;
  price: number;
  quantity: number;
  download_count: number;
  max_downloads: number;
  product?: { slug?: string; title?: string } | null;
}
interface OrderRow {
  id: string;
  order_number: string;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  customer_email?: string;
  customer_name?: string;
  download_token?: string | null;
  order_items?: ItemRow[];
}

const FILTERS = ["all", "pending", "processing", "completed", "cancelled"];

function receiptHtml(o: OrderRow) {
  const rows = (o.order_items ?? [])
    .map(
      (i) =>
        `<tr><td style="padding:8px 0">${i.quantity}× ${i.title}</td><td style="text-align:right;padding:8px 0">KES ${Number(i.price).toLocaleString()}</td></tr>`
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${o.order_number}</title></head>
<body style="font-family:Arial,sans-serif;max-width:560px;margin:40px auto;color:#0a1240">
<h1 style="font-size:20px">⚡ JM Majiwa — Receipt</h1>
<p><strong>${o.order_number}</strong><br/>${formatDate(o.created_at)}</p>
<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding:8px 0;border-top:2px solid #0a1240"><strong>Total (M-Pesa)</strong></td><td style="text-align:right;padding:8px 0;border-top:2px solid #0a1240"><strong>KES ${Number(o.total).toLocaleString()}</strong></td></tr></table>
<p style="color:#666;font-size:12px">Learn Faster. Create Smarter. Grow with AI.<br/>Support: streetpandacyber@gmail.com • WhatsApp +254 745 198 099</p>
</body></html>`;
}

export default function OrdersPage() {
  const { configured, loading, user, orders } = useDashboard() as ReturnType<
    typeof useDashboard
  > & { orders: OrderRow[] };
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  if (loading) {
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

  const all = (orders ?? []) as OrderRow[];
  const list = filter === "all" ? all : all.filter((o) => o.status === filter);

  const downloadItem = async (o: OrderRow, item: ItemRow) => {
    if (!o.download_token) return toast.error("No download link for this order");
    try {
      const res = await fetch(`/api/downloads/${o.download_token}/${item.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Download failed");
      window.open(data.download_url, "_blank", "noopener");
      toast.success("Download started ⬇️");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  };

  const downloadReceipt = (o: OrderRow) => {
    const blob = new Blob([receiptHtml(o)], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `receipt-${o.order_number}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Receipt downloaded 🧾");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">My Orders</h1>
        <p className="mt-1 text-gray-500">{all.length} order{all.length === 1 ? "" : "s"} placed</p>
      </div>

      {/* status filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors",
              filter === f ? "bg-orange-500 text-white shadow-glow-orange" : "bg-white text-gray-500 shadow-soft-sm hover:bg-gray-50"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card-premium flex flex-col items-center gap-4 p-14 text-center">
          <span className="text-5xl">📦</span>
          <h2 className="text-lg font-bold text-navy-800">No {filter !== "all" ? filter : ""} orders</h2>
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <div key={o.id} className="card-premium overflow-hidden">
              <button
                onClick={() => setOpen(open === o.id ? null : o.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div>
                  <p className="font-extrabold text-navy-800">{o.order_number}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDate(o.created_at)} • {o.order_items?.length ?? 0} item(s) •{" "}
                    <span className="font-bold text-navy-700">{formatPrice(Number(o.total), o.currency)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.payment_status} />
                  <StatusBadge status={o.status} />
                  <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform", open === o.id && "rotate-180")} />
                </div>
              </button>

              {open === o.id && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-5">
                  <ul className="space-y-3">
                    {(o.order_items ?? []).map((i) => (
                      <li key={i.id} className="flex flex-wrap items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-navy-800">{i.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(Number(i.price))} • qty {i.quantity}
                          </p>
                        </div>
                        {o.payment_status === "paid" && (
                          <button
                            onClick={() => downloadItem(o, i)}
                            className="btn-primary !px-3.5 !py-2 text-xs"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </button>
                        )}
                        {o.status === "completed" && i.product?.slug && (
                          <Link
                            href={`/products/${i.product.slug}#reviews`}
                            className="btn-secondary !px-3.5 !py-2 text-xs"
                          >
                            <MessageSquarePlus className="h-3.5 w-3.5" /> Leave Review
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => downloadReceipt(o)} className="btn-ghost text-xs">
                      <FileDown className="h-3.5 w-3.5" /> Download receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
