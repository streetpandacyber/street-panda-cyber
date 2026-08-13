"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, FileText, HardDrive, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadCardProps {
  title: string;
  imageUrl?: string;
  format?: string;
  size?: string;
  downloadsUsed?: number;
  maxDownloads?: number;
  onDownload: () => Promise<void> | void;
}

/** Card shown on the payment-success step for each purchased product. */
export function DownloadCard({
  title,
  imageUrl,
  format,
  size,
  downloadsUsed,
  maxDownloads,
  onDownload,
}: DownloadCardProps) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await onDownload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Download failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium flex items-center gap-4 !rounded-2xl p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl">
            📦
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-navy-800">{title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {format && (
            <span className="badge-navy !gap-1">
              <FileText className="h-3 w-3" /> {format}
            </span>
          )}
          {size && (
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" /> {size}
            </span>
          )}
          {maxDownloads !== undefined && (
            <span
              className={
                (downloadsUsed ?? 0) >= maxDownloads
                  ? "font-semibold text-red-500"
                  : "text-gray-400"
              }
            >
              Downloads: {downloadsUsed ?? 0}/{maxDownloads}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handle}
        disabled={loading}
        className="btn-primary shrink-0 !px-4 !py-2.5 text-sm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download Now
      </button>
    </div>
  );
}
