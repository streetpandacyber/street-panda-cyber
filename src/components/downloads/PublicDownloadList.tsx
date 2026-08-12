"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DownloadCard } from "@/components/checkout/DownloadCard";

export interface PublicDownloadItem {
  id: string;
  title: string;
  product_id: string | null;
  downloads_used: number;
  downloads_remaining: number;
  url: string;
  product?: {
    title?: string;
    thumbnail_url?: string;
    file_format?: string;
    file_size?: string;
  } | null;
}

interface PublicDownloadListProps {
  items: PublicDownloadItem[];
}

/** Client-side download buttons for the public /downloads/[token] page. */
export function PublicDownloadList({ items }: PublicDownloadListProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const download = async (item: PublicDownloadItem) => {
    if (item.downloads_remaining - (counts[item.id] ?? 0) <= 0) {
      toast.error("Download limit reached for this item.");
      return;
    }
    const res = await fetch(item.url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Download failed");
    window.open(data.download_url, "_blank", "noopener");
    setCounts((c) => ({ ...c, [item.id]: (c[item.id] ?? 0) + 1 }));
    toast.success("Download started ⬇️");
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <DownloadCard
          key={item.id}
          title={item.title}
          imageUrl={item.product?.thumbnail_url}
          format={item.product?.file_format}
          size={item.product?.file_size}
          downloadsUsed={item.downloads_used + (counts[item.id] ?? 0)}
          maxDownloads={item.downloads_used + item.downloads_remaining}
          onDownload={() => download(item)}
        />
      ))}
    </div>
  );
}
