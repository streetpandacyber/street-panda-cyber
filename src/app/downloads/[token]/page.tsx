import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Gift, Lock, User, Zap } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/utils";
import { PublicDownloadList } from "@/components/downloads/PublicDownloadList";

export const metadata: Metadata = {
  title: "Your Downloads",
  description: "Your JM Majiwa purchases are ready to download.",
  robots: { index: false, follow: false },
};

interface TokenPageProps {
  params: { token: string };
}

export default async function TokenDownloadsPage({ params }: TokenPageProps) {
  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="container-custom flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-gradient">
              <Zap className="h-4 w-4 text-white" fill="currentColor" />
            </span>
            <span className="font-extrabold text-navy-800">
              JM <span className="text-gradient-orange">Majiwa</span>
            </span>
          </Link>
          <Link href="/marketplace" className="btn-ghost text-sm">
            Browse Store
          </Link>
        </div>
      </header>
      <main className="container-custom max-w-3xl py-12">{children}</main>
    </div>
  );

  if (!isSupabaseConfigured()) {
    return shell(
      <div className="card-premium p-10 text-center">
        <span className="text-5xl">🔧</span>
        <h1 className="mt-4 text-xl font-bold text-navy-800">
          Downloads activate once Supabase is configured
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          This secure link will list your purchased products as soon as the
          store is connected to its database.
        </p>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, created_at, payment_status, download_expires_at, order_items(*, product:products(title, thumbnail_url, file_format, file_size))"
    )
    .eq("download_token", params.token)
    .single();

  if (!order) notFound();

  if (order.payment_status !== "paid") {
    return shell(
      <div className="card-premium p-10 text-center">
        <span className="text-5xl">⏳</span>
        <h1 className="mt-4 text-xl font-bold text-navy-800">
          Payment not completed yet
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          These downloads unlock the moment your M-Pesa payment confirms.
        </p>
      </div>
    );
  }

  if (
    order.download_expires_at &&
    new Date(order.download_expires_at) < new Date()
  ) {
    return shell(
      <div className="card-premium p-10 text-center">
        <span className="text-5xl">⌛</span>
        <h1 className="mt-4 text-xl font-bold text-navy-800">
          This download link has expired
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Links stay active for one year. Create a free account (or sign in) to
          access your library anytime — or email streetpandacyber@gmail.com and
          we&apos;ll refresh this link for you.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/register" className="btn-primary">
            Create Free Account
          </Link>
          <Link href="/contact" className="btn-secondary">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  const items = (order.order_items ?? []).map(
    (i: {
      id: string;
      title: string;
      product_id: string | null;
      download_count: number;
      max_downloads: number;
      product?: {
        title?: string;
        thumbnail_url?: string;
        file_format?: string;
        file_size?: string;
      } | null;
    }) => ({
      id: i.id,
      title: i.title,
      product_id: i.product_id,
      downloads_used: i.download_count,
      downloads_remaining: Math.max(0, i.max_downloads - i.download_count),
      url: `/api/downloads/${params.token}/${i.id}`,
      product: i.product ?? null,
    })
  );

  return shell(
    <div>
      <div className="text-center">
        <span className="badge-neon mx-auto inline-flex">
          <Lock className="h-3 w-3" /> Secure download link
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-navy-800">
          Hi {order.customer_name?.split(" ")[0] ?? "there"}! Your products are
          ready 🎉
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" /> {order.customer_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {formatDate(order.created_at)}
          </span>
          <span className="badge-navy">{order.order_number}</span>
        </div>
      </div>

      <div className="mt-10">
        <PublicDownloadList items={items} />
      </div>

      <div className="card-premium mt-10 flex flex-col items-center gap-3 bg-navy-50 p-6 text-center">
        <Gift className="h-6 w-6 text-orange-500" />
        <p className="text-sm font-semibold text-navy-800">
          Save your downloads forever
        </p>
        <p className="max-w-md text-xs text-gray-500">
          Create a free account to keep every purchase in your personal
          library — re-download anytime, on any device.
        </p>
        <Link href="/register" className="btn-primary mt-1 !py-2.5 text-sm">
          Create Free Account
        </Link>
      </div>
    </div>
  );
}
