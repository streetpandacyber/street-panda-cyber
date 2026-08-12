import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-64 rounded bg-white/10" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-3xl bg-white/10" />
        ))}
      </div>
      <div className="h-72 rounded-3xl bg-white/10" />
      <TableSkeleton rows={5} />
    </div>
  );
}
