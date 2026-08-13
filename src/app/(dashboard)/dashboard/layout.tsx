"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Download,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: Package },
  { label: "Downloads", href: "/dashboard/downloads", icon: Download },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      toast.info("Authentication is not configured in this environment.");
      return;
    }
    await createClient().auth.signOut();
    toast.success("Signed out. See you soon!");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
        <div className="container-custom flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-gradient">
              <Zap className="h-4 w-4 text-white" fill="currentColor" />
            </span>
            <span className="font-extrabold text-navy-800">
              JM <span className="text-gradient-orange">Majiwa</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="btn-ghost text-sm">
              ← Back to Store
            </Link>
            <button onClick={signOut} className="btn-ghost text-sm !text-gray-500">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside>
          <nav className="card-premium sticky top-24 flex flex-row gap-1 overflow-x-auto p-2 no-scrollbar lg:flex-col">
            {LINKS.map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-navy-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 pb-16">{children}</main>
      </div>
    </div>
  );
}
