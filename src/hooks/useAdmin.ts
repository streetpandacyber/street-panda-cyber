"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, Product } from "@/types";

interface AdminAnalytics {
  range: { days: number; from: string; to: string };
  revenue: { total: number; previous: number; changePct: number };
  orders: {
    total: number;
    previous: number;
    changePct: number;
    byStatus: Record<string, number>;
  };
  customers: { total: number; new: number; previousNew: number; changePct: number };
  downloads: { total: number; previous: number; changePct: number };
  revenueSeries: { date: string; revenue: number }[];
  ordersSeries: { date: string; orders: number }[];
  customerGrowthSeries: { date: string; total: number }[];
  topProducts: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
    sales: number;
    revenue: number;
    rating: number;
    views: number;
    conversion: number;
  }[];
  revenueByCategory: { category: string; revenue: number }[];
  recentOrders: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    items_count: number;
    total: number;
    status: string;
    payment_status: string;
    mpesa_transaction_id: string | null;
    created_at: string;
  }[];
}

export type { AdminAnalytics };

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
