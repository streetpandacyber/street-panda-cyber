import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-extrabold text-white md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function DeltaBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
        up ? "bg-neon-500/15 text-neon-300" : "bg-red-500/15 text-red-300"
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-neon-500/15 text-neon-300",
  paid: "bg-neon-500/15 text-neon-300",
  pending: "bg-yellow-500/15 text-yellow-300",
  processing: "bg-blue-500/15 text-blue-300",
  cancelled: "bg-red-500/15 text-red-300",
  failed: "bg-red-500/15 text-red-300",
  refunded: "bg-gray-500/15 text-gray-300",
  published: "bg-neon-500/15 text-neon-300",
  draft: "bg-gray-500/15 text-gray-300",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
        STATUS_STYLES[status] ?? "bg-gray-500/15 text-gray-300"
      )}
    >
      {status}
    </span>
  );
}

export const inputCls =
  "w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-orange-400";
export const selectCls = inputCls + " appearance-none";
export const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50";
