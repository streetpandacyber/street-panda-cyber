import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-neon-100 text-neon-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-neon-100 text-neon-700",
  cancelled: "bg-red-100 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize",
        STYLES[status] ?? "bg-gray-100 text-gray-600"
      )}
    >
      {status}
    </span>
  );
}
