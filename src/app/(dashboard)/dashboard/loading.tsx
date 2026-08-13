import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="container-custom py-10">
      <DashboardSkeleton />
    </div>
  );
}
