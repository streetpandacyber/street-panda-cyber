import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import { getBundles } from "@/lib/data/service";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Card, PageHeader, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminBundlesPage() {
  const bundles = await getBundles();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bundles"
        subtitle="Value packs across your catalogue"
        action={
          <Link href="/bundles" className="btn-secondary !py-2.5 text-sm">
            View storefront page →
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {bundles.map((b) => (
          <Card key={b.id} className="!p-0 overflow-hidden">
            <div className="relative aspect-[16/9] bg-white/10">
              {b.thumbnail_url && (
                <Image src={b.thumbnail_url} alt={b.title} fill sizes="400px" className="object-cover" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white">{b.title}</h2>
                <StatusPill status={b.is_published ? "published" : "draft"} />
              </div>
              <p className="mt-1 text-xs text-white/40">{b.products?.length ?? 0} products</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-white">{formatPrice(b.bundle_price)}</span>
                <span className="text-sm text-white/30 line-through">{formatPrice(b.original_price)}</span>
                <span className="rounded-full bg-neon-500/15 px-2 py-0.5 text-[10px] font-bold text-neon-300">
                  -{calculateDiscount(b.original_price, b.bundle_price)}%
                </span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-white/40">
                <Gift className="h-3.5 w-3.5" /> Manage bundle contents in supabase/seed.sql
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
