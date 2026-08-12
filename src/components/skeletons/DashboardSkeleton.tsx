export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-40 rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-3xl bg-gray-200" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-gray-100" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="h-20 rounded-3xl bg-gray-100" />
        <div className="h-20 rounded-3xl bg-gray-100" />
      </div>
    </div>
  );
}
