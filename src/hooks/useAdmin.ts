"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, Product } from "@/types";

interface AdminAnalytics {
  revenue: { today: number; week: number; month: number; allTime: number };
  orders_by_status: Record<string, number>;
  top_products: { title: string; total_sales: number; revenue: number }[];
  revenue_by_category: { category: string; revenue: number }[];
  new_customers: { month: number; total: number };
  downloads: { total: number; month: number };
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export function useAdmin() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await getJson<{ data: AdminAnalytics }>("/api/admin/analytics");
      setAnalytics(res.data);
      return res.data;
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics().catch(() => setLoadingAnalytics(false));
  }, [fetchAnalytics]);

  const fetchProducts = useCallback(
    (params: { search?: string; page?: number } = {}) => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.page) sp.set("page", String(params.page));
      return getJson<{ data: Product[]; pagination: unknown }>(
        `/api/admin/products?${sp}`
      );
    },
    []
  );

  const createProduct = useCallback(
    (payload: Record<string, unknown>) =>
      getJson<{ data: Product }>("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    []
  );

  const updateProduct = useCallback(
    (id: string, payload: Record<string, unknown>) =>
      getJson<{ data: Product }>(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    []
  );

  const deleteProduct = useCallback(
    (id: string) =>
      getJson<{ success: boolean }>(`/api/admin/products/${id}`, {
        method: "DELETE",
      }),
    []
  );

  const fetchOrders = useCallback(
    (params: { status?: string; search?: string; page?: number } = {}) => {
      const sp = new URLSearchParams();
      if (params.status) sp.set("status", params.status);
      if (params.search) sp.set("search", params.search);
      if (params.page) sp.set("page", String(params.page));
      return getJson<{ data: Order[]; pagination: unknown }>(
        `/api/admin/orders?${sp}`
      );
    },
    []
  );

  const updateOrderStatus = useCallback(
    (id: string, updates: { status?: string; payment_status?: string }) =>
      getJson<{ data: Order }>("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      }),
    []
  );

  const uploadFile = useCallback(async (file: File, type: "image" | "file") => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.data as { bucket: string; path: string; url: string };
  }, []);

  return {
    analytics,
    loadingAnalytics,
    fetchAnalytics,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchOrders,
    updateOrderStatus,
    uploadFile,
  };
}
