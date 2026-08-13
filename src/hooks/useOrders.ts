"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import type { Order } from "@/types";

export function useOrders() {
  const configured = isSupabaseConfigured();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOrders = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setOrders([]);
        return [];
      }
      const { data, error: err } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      if (err) throw new Error(err.message);
      const list = (data as unknown as Order[]) ?? [];
      setOrders(list);
      return list;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
      return [];
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const fetchOrder = useCallback(async (id: string): Promise<Order> => {
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Order not found");
    return data.data as Order;
  }, []);

  const createOrder = useCallback(
    async (payload: {
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      coupon_code?: string;
      items: {
        product_id?: string;
        bundle_id?: string;
        title: string;
        price: number;
        quantity: number;
      }[];
    }): Promise<Order & { demo?: boolean }> => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create order");
      return data as Order & { demo?: boolean };
    },
    []
  );

  return { orders, loading, error, fetchMyOrders, fetchOrder, createOrder, reload: fetchMyOrders };
}
