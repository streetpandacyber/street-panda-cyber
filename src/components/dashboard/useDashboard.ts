"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import type { Order, Profile } from "@/types";

interface DashboardState {
  configured: boolean;
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  orders: Order[];
  ordersLoading: boolean;
}

export function useDashboard(requireAuth = true): DashboardState {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      setOrdersLoading(false);
      return;
    }
    const supabase = createClient();
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const u = data.user;
        setUser(u);
        if (!u) {
          if (requireAuth) router.replace("/login?next=/dashboard");
          return;
        }
        const [profileRes, ordersRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", u.id).single(),
          supabase
            .from("orders")
            .select(
              "*, order_items(*, product:products(title, slug, thumbnail_url, file_format, file_size, category:categories(name)))"
            )
            .eq("user_id", u.id)
            .order("created_at", { ascending: false }),
        ]);
        if (profileRes.data) setProfile(profileRes.data as Profile);
        if (ordersRes.data) setOrders(ordersRes.data as unknown as Order[]);
      } catch {
        /* network or schema issues — show empty states */
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    })();
  }, [configured, requireAuth, router]);

  return { configured, loading, user, profile, orders, ordersLoading };
}
