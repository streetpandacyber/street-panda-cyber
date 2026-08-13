"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Download,
  Heart,
  Package,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { useWishlistStore } from "@/store/wishlistStore";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Product } from "@/types";

interface DashOrderItem {
  id: string;
  title: string;
  price: number;
  download_count: number;
  max_downloads: number;
  product?: {
    title?: string;
    slug?: string;
    thumbnail_url?: string;
    file_format?: string;
    file_size?: string;
    category?: { name?: string } | null;
  } | null;
}
interface DashOrder {
  id: string;
  order_number: string;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  download_token?: string | null;
  download_expires_at?: string | null;
  order_items?: DashOrderItem[];
}

export default function DashboardPage() {
  const { configured, loading, user, profile, orders } =
    useDashboard() as ReturnType<typeof useDashboard> & { orders: DashOrder[] };
  const localWishlist = useWishlistStore((s) => s.items.length);
  const [wishlistCount, setWishlistCount] = useState(localWishlist);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=4")
      .then((r) => r.json())
      .then((d) => setFeatured(d.data ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (configured && user) {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((d) => setWishlistCount(Array.isArray(d.data) ? d.data.length : localWishlist))
        .catch(() => setWishlistCount(localWishlist));
    }
  }, [configured, user, localWishlist]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="animate-pulse text-3xl">⏳</span>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="card-premium p-10 text-center">
        <span className="text-5xl">🔐</span>
        <h1 className="mt-4 text-xl font-bold text-navy-800">
          Connect Supabase to unlock your dashboard
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Add your Supabase URL and keys to the environment variables to enable
          accounts, orders and downloads. Meanwhile, enjoy browsing the store!
        </p>
        <Link href="/marketplace" className="btn-primary mt-6">
          <ShoppingBag className="h-4 w-4" /> Browse Marketplace
        </Link>
      </div>
    );
  }

  if (!user) return null; // middleware redirects to login

  const typedOrders = (orders ?? []) as DashOrder[];
  const paidOrders = typedOrders.filter((o) => o.payment_status === "paid");
  const totalDownloads = paidOrders.reduce(
    (sum, o) => sum + (o.order_items?.length ?? 0),
    0
  );
  const recent = typedOrders.slice(0, 3);
  const quickDownloads = paidOrders
    .flatMap((o) =>
      (o.order_items ?? []).map((item) => ({ item, order: o }))
    )
    .slice(0, 3);

  const firstName = (profile?.full_name || user.email?.split("@")[0] || "there")
    .split(" ")[0];

  // profile completion
  const checks = [
    Boolean(profile?.full_name),
    Boolean(profile?.phone),
    Boolean(profile?.avatar_url),
    Boolean(profile?.city),
    Boolean(profile?.bio),
  ];
  const completion = Math.round(
    ((checks.filter(Boolean).length + 1) / (checks.length + 1)) * 100
  ); // +1 for the account itself

  const downloadItem = async (order: DashOrder, item: DashOrderItem) => {
    if (!order.download_token) {
      toast.error("Download link not available for this order");
      return;
    }
    try {
      const res = await fetch(`/api/downloads/${order.download_token}/${item.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Download failed");
      window.open(data.download_url, "_blank", "noopener");
      toast.success("Download started ⬇️");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
      <div className="space-y-8">
        {/* welcome */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">
            Welcome back, <span className="text-gradient-orange">{firstName}</span>! 👋
          </h1>
          <p className="mt-1 text-gray-500">Here&apos;s what&apos;s happening with your account.</p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: "Total Orders", value: typedOrders.length, icon: Package, bg: "bg-navy-50 text-navy-600", href: "/dashboard/orders" },
            { label: "Total Downloads", value: totalDownloads, icon: Download, bg: "bg-neon-50 text-neon-600", href: "/dashboard/downloads" },
            { label: "Wishlist Items", value: wishlistCount, icon: Heart, bg: "bg-orange-50 text-orange-600", href: "/dashboard/wishlist" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href} className="card-premium flex items-center gap-4 p-6">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-navy-800">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* profile completion */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-navy-800">Profile completion</h2>
            <span className="text-sm font-extrabold text-orange-600">{completion}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-orange-gradient transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <p className="mt-2 text-xs text-gray-500">
              Add your phone, city, bio or avatar to reach 100% —{" "}
              <Link href="/dashboard/profile" className="font-bold text-orange-600 hover:underline">
                complete profile
              </Link>
            </p>
          )}
        </div>

        {/* recent orders */}
        <div className="card-premium overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-bold text-navy-800">Recent orders</h2>
            <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-gray-500">
              No orders yet — your first purchase is one click away! 🚀
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="font-bold text-navy-800">{o.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(o.created_at)} • {o.order_items?.length ?? 0} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-navy-800">{formatPrice(Number(o.total), o.currency)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* quick downloads */}
        <div className="card-premium overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-bold text-navy-800">Quick downloads</h2>
            <Link href="/dashboard/downloads" className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:underline">
              All downloads <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {quickDownloads.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-gray-500">Purchases you make appear here for one-tap downloads.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {quickDownloads.map(({ item, order }) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.product?.thumbnail_url ? (
                      <Image src={item.product.thumbnail_url} alt={item.title} fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xl">📦</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-semibold text-navy-800">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.product?.file_format ?? "Digital"} • {item.download_count}/{item.max_downloads} downloads used
                    </p>
                  </div>
                  <button onClick={() => downloadItem(order, item)} className="btn-primary !px-4 !py-2 text-xs">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* featured sidebar */}
      <aside className="space-y-5">
        <div className="card-premium p-6">
          <h2 className="flex items-center gap-2 font-bold text-navy-800">
            <Star className="h-4 w-4 fill-orange-500 text-orange-500" /> Featured for you
          </h2>
          <div className="mt-4 space-y-4">
            {featured.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {p.thumbnail_url && (
                    <Image src={p.thumbnail_url} alt={p.title} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold text-navy-800 group-hover:text-orange-600">{p.title}</p>
                  <p className="text-xs font-bold text-orange-600">{formatPrice(p.sale_price ?? p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-gradient rounded-3xl p-6 text-white">
          <p className="text-lg font-extrabold">Need help? 💬</p>
          <p className="mt-1 text-sm text-white/70">
            WhatsApp +254 745 198 099 or email streetpandacyber@gmail.com — we reply within hours.
          </p>
        </div>
      </aside>
    </div>
  );
}
