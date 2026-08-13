"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types";

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const f = JSON.parse(queryKey) as ProductFilters;
      const sp = new URLSearchParams();
      if (f.category) sp.set("category", f.category);
      if (f.search) sp.set("search", f.search);
      if (f.sort) sp.set("sort", f.sort);
      if (f.minPrice !== undefined) sp.set("minPrice", String(f.minPrice));
      if (f.maxPrice !== undefined) sp.set("maxPrice", String(f.maxPrice));
      if (f.tags) sp.set("tags", f.tags);
      if (f.featured) sp.set("featured", "true");
      if (f.page) sp.set("page", String(f.page));
      if (f.limit) sp.set("limit", String(f.limit));
      const data = await getJson<{ data: Product[]; pagination: { total: number } }>(
        `/api/products?${sp.toString()}`
      );
      setProducts(data.data);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, setProducts, total, loading, error, reload: load };
}

/* One-shot fetchers (don't hold state) */

export async function fetchProduct(slug: string): Promise<Product & { reviews?: unknown[]; related_products?: Product[] }> {
  return (await getJson<{ data: Product & { reviews?: unknown[]; related_products?: Product[] } }>(
    `/api/products/${slug}`
  )).data;
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  return (
    await getJson<{ data: Product[] }>(`/api/products?featured=true&limit=8`)
  ).data;
}

export async function fetchBestSellers(): Promise<Product[]> {
  return (await getJson<{ data: Product[] }>(`/api/products?sort=popular&limit=6`)).data;
}

export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  return (
    await getJson<{ data: Product[] }>(`/api/products?category=${categorySlug}&limit=24`)
  ).data;
}
