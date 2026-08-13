export function ProductCardSkeleton() {
  return (
    <div className="card-premium overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-gray-200" />
      <div className="space-y-3 p-5">
        <div className="flex justify-between">
          <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-3 w-14 animate-pulse rounded-full bg-gray-100" />
        </div>
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="flex items-end justify-between border-t border-gray-100 pt-4">
          <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
