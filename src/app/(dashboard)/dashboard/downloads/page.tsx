"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { formatDate } from "@/lib/utils";

export default function DownloadsPage() {
  const { configured, loading, user, orders, ordersLoading } = useDashboard();
  const [downloading, setDownloading] = useState<string | null>(null);

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
        Sign in with a configured account to access your downloads.
      </div>
    );
  }

  const items = orders
    .filter((o) => o.payment_status === "paid" && o.download_token)
    .flatMap((o) =>
      (o.order_items ?? []).map((item) => ({
        item,
        token: o.download_token!,
        expires: o.download_expires_at,
        orderNumber: o.order_number,
      }))
    );

  const requestDownload = async (token: string, itemId: string) => {
    setDownloading(itemId);
    try {
      const res = await fetch(`/api/downloads/${token}/${itemId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Download unavailable");
      window.open(data.download_url, "_blank");
      toast.success("Download started ⬇️");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not start download"
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">
        My Downloads
      </h1>
      <p className="mt-1 text-gray-500">
        Every product you&apos;ve purchased — available anytime.
      </p>

      {items.length === 0 ? (
        <div className="card-premium mt-8 flex flex-col items-center gap-4 p-14 text-center">
          <span className="text-5xl">⬇️</span>
          <h2 className="text-lg font-bold text-navy-800">No downloads yet</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Purchase any product and it will appear here with instant download
            access.
          </p>
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map(({ item, token, expires, orderNumber }) => (
            <div
              key={item.id}
              className="card-premium flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-2xl">
                📦
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy-800">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Order {orderNumber} • Downloads used: {item.download_count}/
                  {item.max_downloads}
                  {expires && <> • Access until {formatDate(expires)}</>}
                </p>
              </div>
              <button
                onClick={() => requestDownload(token, item.id)}
                disabled={downloading === item.id}
                className="btn-primary shrink-0 !px-5 !py-2.5 text-sm"
              >
                {downloading === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
