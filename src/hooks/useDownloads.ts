"use client";

import { useCallback, useState } from "react";

export interface DownloadItem {
  id: string;
  title: string;
  product_id: string | null;
  downloads_used: number;
  downloads_remaining: number;
  url: string;
}

export class DownloadLimitError extends Error {}

export function useDownloads() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDownloads = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/downloads/${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load downloads");
      return data.data as {
        order_number: string;
        expires_at: string;
        items: DownloadItem[];
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load downloads");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (token: string, itemId: string) => {
    setError(null);
    const res = await fetch(`/api/downloads/${token}/${itemId}`);
    const data = await res.json();
    if (res.status === 429) {
      throw new DownloadLimitError(
        data.error ?? "Download limit reached for this item."
      );
    }
    if (!res.ok) throw new Error(data.error ?? "Download failed");
    window.open(data.download_url, "_blank", "noopener");
    return data as { download_url: string; expires_in_seconds: number };
  }, []);

  return { loading, error, fetchDownloads, downloadFile };
}
