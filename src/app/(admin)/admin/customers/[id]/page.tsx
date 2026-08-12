"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, ShoppingBag, Wallet } from "lucide-react";
import { formatPrice, formatDate, getInitials } from "@/lib/utils";
import { Card, PageHeader, StatusPill } from "@/components/admin/ui";

interface CustomerDetail {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    country: string;
    city: string | null;
    bio: string | null;
    created_at: string;
  };
  orders: {
    id: string;
    order_number: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
    order_items: { title: string; price: number; quantity: number; download_count: number }[];
  }[];
  stats: { total_orders: number; total_spent: number; downloads_accessed: number };
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/customers/${params.id}`);
        const json = await res.json();
        setData(json.data ?? null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><span className="animate-pulse text-3xl">⏳</span></div>;
  }

  if (!data) {
    return <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/60">Customer not found.</div>;
  }

  const { profile, orders, stats } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={profile.full_name ?? profile.email}
        subtitle={`Customer since ${formatDate(profile.created_at)}`}
        action={
          <Link href="/admin/customers" className="btn-secondary !py-2.5 text-sm">
            <ArrowLeft className="h-4 w-4" /> All Customers
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <ShoppingBag className="h-5 w-5 text-orange-300" />
          <p className="mt-3 text-2xl font-extrabold text-white">{stats.total_orders}</p>
          <p className="text-xs text-white/40">Total orders</p>
        </Card>
        <Card>
          <Wallet className="h-5 w-5 text-neon-300" />
          <p className="mt-3 text-2xl font-extrabold text-white">{formatPrice(stats.total_spent)}</p>
          <p className="text-xs text-white/40">Lifetime spend</p>
        </Card>
        <Card>
          <Download className="h-5 w-5 text-blue-300" />
          <p className="mt-3 text-2xl font-extrabold text-white">{stats.downloads_accessed}</p>
          <p className="text-xs text-white/40">Downloads accessed</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <h2 className="text-lg font-bold text-white">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-600 text-xl font-bold text-white">
              {getInitials(profile.full_name ?? profile.email)}
            </span>
            <div>
              <p className="font-bold text-white">{profile.full_name ?? "—"}</p>
              <p className="text-sm text-white/50">{profile.email}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/40">Phone</dt><dd className="text-white/80">{profile.phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-white/40">Location</dt><dd className="text-white/80">{[profile.city, profile.country].filter(Boolean).join(", ") || "—"}</dd></div>
            {profile.bio && <div><dt className="text-white/40">Bio</dt><dd className="mt-1 text-white/70">{profile.bio}</dd></div>}
          </dl>
        </Card>

        <Card className="!p-0">
          <h2 className="p-6 pb-0 text-lg font-bold text-white">Order history</h2>
          {orders.length === 0 ? (
            <p className="p-6 text-sm text-white/40">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/5">
              {orders.map((o) => (
                <li key={o.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{o.order_number}</p>
                    <StatusPill status={o.status} />
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    {formatDate(o.created_at)} • {o.order_items?.length ?? 0} item(s) •{" "}
                    <span className="font-bold text-white/70">{formatPrice(Number(o.total))}</span>
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-white/30">
                    {o.order_items?.map((i) => i.title).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
