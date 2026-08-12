"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  Gift,
  LayoutGrid,
  LogOut,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  productCount?: number;
  pendingOrders?: number;
  adminName?: string;
  adminEmail?: string;
  demoMode?: boolean;
}

const SECTIONS: {
  title: string;
  links: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: "products" | "pending";
  }[];
}[] = [
  {
    title: "Overview",
    links: [
      { label: "Dashboard", href: "/admin", icon: BarChart3 },
      { label: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    ],
  },
  {
    title: "Store",
    links: [
      { label: "Products", href: "/admin/products", icon: Package, badge: "products" },
      { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
      { label: "Bundles", href: "/admin/bundles", icon: Gift },
    ],
  },
  {
    title: "Sales",
    links: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: "pending" },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Blog Posts", href: "/admin/blog", icon: FileText },
      { label: "Learning Hub", href: "/admin/learning-hub", icon: BookOpen },
    ],
  },
  {
    title: "Settings",
    links: [
      { label: "Store Settings", href: "/admin/settings", icon: Settings },
      { label: "Email Templates", href: "/admin/email-templates", icon: Mail },
    ],
  },
];

export function AdminSidebar({
  productCount,
  pendingOrders,
  adminName,
  adminEmail,
  demoMode,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }
    toast.success("Signed out. See you soon!");
    window.location.href = "/";
  };

  return (
    <aside className="sticky top-0 flex h-screen w-20 shrink-0 flex-col border-r border-white/10 bg-navy-900 lg:w-72">
      {/* Logo */}
      <Link href="/admin" className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4 lg:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-gradient">
          <Zap className="h-5 w-5 text-white" fill="currentColor" />
        </span>
        <span className="hidden lg:block">
          <span className="block text-sm font-extrabold text-white">
            JM <span className="text-orange-400">Majiwa</span>
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Admin Panel
          </span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-3 no-scrollbar lg:p-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 hidden px-3 text-[10px] font-bold uppercase tracking-widest text-white/30 lg:block">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = link.icon;
                const active =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(link.href);
                const badge =
                  link.badge === "products" ? productCount : link.badge === "pending" ? pendingOrders : undefined;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    className={cn(
                      "flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors lg:justify-start",
                      active
                        ? "bg-orange-500 text-white shadow-glow-orange"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="hidden flex-1 lg:inline">{link.label}</span>
                    {badge !== undefined && badge > 0 && (
                      <span
                        className={cn(
                          "hidden rounded-full px-2 py-0.5 text-[10px] font-bold lg:inline",
                          active ? "bg-white/20 text-white" : "bg-orange-500/20 text-orange-300"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile */}
      <div className="border-t border-white/10 p-3 lg:p-4">
        <div className="flex items-center justify-center gap-3 lg:justify-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white">
            {(adminName ?? "A").slice(0, 1).toUpperCase()}
          </span>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm font-bold text-white">{adminName}</p>
            <p className="truncate text-xs text-white/40">{adminEmail}</p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="hidden rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white lg:block"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={signOut}
          className="mt-2 flex w-full items-center justify-center rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
        {demoMode && (
          <p className="mt-2 hidden text-center text-[10px] text-white/30 lg:block">
            Demo mode — connect Supabase for live data
          </p>
        )}
      </div>
    </aside>
  );
}
