export function ProductPageSkeleton() {
  return (
    <div className="container-custom animate-pulse py-10 md:py-14">
      {/* breadcrumb */}
      <div className="flex gap-2">
        <div className="h-4 w-14 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-100" />
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="aspect-[4/3] rounded-3xl bg-gray-200" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 w-20 rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>

        {/* details */}
        <div className="space-y-5">
          <div className="h-6 w-28 rounded-full bg-gray-200" />
          <div className="h-9 w-4/5 rounded bg-gray-200" />
          <div className="h-9 w-3/5 rounded bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-5 w-24 rounded bg-gray-100" />
            <div className="h-5 w-20 rounded bg-gray-100" />
          </div>
          <div className="h-10 w-40 rounded bg-gray-200" />
          <div className="h-14 w-full rounded-xl bg-gray-200" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-2xl bg-gray-100" />
            ))}
          </div>
          <div className="h-32 rounded-2xl bg-gray-100" />
        </div>
      </div>

      <div className="mt-16 space-y-3">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  );
}
