import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export default function MarketplaceLoading() {
  return (
    <div className="container-custom py-10">
      <div className="h-9 w-52 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
      <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-gray-100" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
        <div className="hidden h-96 animate-pulse rounded-3xl bg-gray-100 lg:block" />
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
