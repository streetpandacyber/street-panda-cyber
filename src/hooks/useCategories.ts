"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types";

type CategoryWithCount = Category & { product_count: number };

/* Simple module-level cache with a 5-minute TTL */
let cache: { at: number; data: CategoryWithCount[] } | null = null;
const TTL = 5 * 60 * 1000;

export function useCategories(forceReload = false) {
  const [categories, setCategories] = useState<CategoryWithCount[]>(
    cache?.data ?? []
  );
  const [loading, setLoading] = useState(!cache || forceReload);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache && !forceReload && Date.now() - cache.at < TTL) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load categories");
        if (!cancelled) {
          cache = { at: Date.now(), data: data.data };
          setCategories(data.data);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceReload]);

  return { categories, loading, error };
}
