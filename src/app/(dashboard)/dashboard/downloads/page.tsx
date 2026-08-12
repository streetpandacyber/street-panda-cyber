"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Download, FileText, HardDrive, Loader2, ShoppingBag } from "lucide-react";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ItemRow {
  id: string;
  title: string;
  download_count: number;
  max_downloads: number;
  product?: {
    title?: string;
    slug?: string;
    thumbnail_url?: string;
    file_format?: string;
    file_size?: string;
    category?: { name?: string } | null;
  } | null;
}
interface OrderRow {
  id: string;
  order_number: string;
  payment_status?: string;
  created_at: string;
  download_token?: string | null;
  download_expires_at?: string | null;
  order_items?: ItemRow[];
}

export default function DownloadsPage() {
  const { configured, loading, user, orders } = useDashboard() as ReturnType<
    typeof useDashboard
  > & { orders: OrderRow[] };
  const [busy, setBusy] = useState<string | null>(null);

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
        Sign in with a configured account to access your downloads.
      </div>
    );
  }

  const rows = ((orders ?? []) as OrderRow[])
    .filter((o) => o.payment_status === "paid" || o.download_token)
    .flatMap((o) => (o.order_items ?? []).map((item) => ({ item, order: o })));

  const expired = (o: OrderRow) =>
    Boolean(o.download_expires_at && new Date(o.download_expires_at) < new Date());

  const download = async (o: OrderRow, item: ItemRow) => {
    if (!o.download_token) return toast.error("Download link unavailable");
    setBusy(item.id);
    try {
      const res = await fetch(`/api/downloads/${o.download_token}/${item.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Download failed");
      window.open(data.download_url, "_blank", "noopener");
      toast.success("Download started ⬇️");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">My Downloads</h1>
        <p className="mt-1 text-gray-500">Every product you&apos;ve purchased — ready when you are.</p>
      </div>

      {rows.length === 0 ? (
        <div className="card-premium flex flex-col items-center gap-4 p-14 text-center">
          <span className="text-5xl">⬇️</span>
          <h2 className="text-lg font-bold text-navy-800">No downloads yet</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Purchase any product and it will appear here with instant download access.
          </p>
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ item, order }) => {
            const isExpired = expired(order);
            const used = item.download_count;
            const max = item.max_downloads;
            return (
              <div key={item.id} className="card-premium flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  {item.product?.thumbnail_url ? (
                    <Image src={item.product.thumbnail_url} alt={item.title} fill sizes="64px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl">📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-navy-800">{item.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    {item.product?.category?.name && (
                      <span className="badge-navy !px-2 !py-0.5">{item.product.category.name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> {formatDate(order.created_at)}
                    </span>
                    {item.product?.file_format && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {item.product.file_format}
                      </span>
                    )}
                    {item.product?.file_size && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" /> {item.product.file_size}
                      </span>
                    )}
                  </div>
                  <p className={cn("mt-1.5 text-xs font-semibold", isExpired ? "text-red-500" : used >= max ? "text-amber-600" : "text-gray-500")}>
                    {isExpired
                      ? "⌛ Download link expired — contact support to refresh"
                      : `Downloads used: ${used} of ${max}`}
                  </p>
                </div>
                <button
                  onClick={() => download(order, item)}
                  disabled={busy === item.id || isExpired || used >= max}
                  className="btn-primary shrink-0 !px-5 !py-2.5 text-sm disabled:opacity-40"
                >
                  {busy === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
