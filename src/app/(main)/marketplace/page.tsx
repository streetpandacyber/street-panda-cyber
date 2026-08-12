import { Suspense } from "react";
import type { Metadata } from "next";
import { MarketplaceAsync } from "@/components/marketplace/MarketplaceAsync";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export const metadata: Metadata = {
  title: "Marketplace — Premium Digital Products",
  description:
    "Browse hundreds of premium digital products: AI prompt packs, Canva templates, eBooks, study materials and business templates. Pay with M-Pesa, download instantly.",
};

export const dynamic = "force-dynamic";

function MarketplaceFallback() {
  return (
    <div className="container-custom py-10">
      <div className="h-9 w-52 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
      <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-gray-100" />
      <div className="mt-8">
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}

export default function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  return (
    <Suspense fallback={<MarketplaceFallback />}>
      <MarketplaceAsync
        initialQuery={searchParams.q}
        initialCategory={searchParams.category}
      />
    </Suspense>
  );
}
