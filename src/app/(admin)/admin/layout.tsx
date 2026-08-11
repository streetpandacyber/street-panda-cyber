"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Add Product", href: "/admin/products/new", icon: PlusCircle },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-gradient">
              <Zap className="h-4 w-4 text-white" fill="currentColor" />
            </span>
            <span className="font-extrabold text-white">
              JM Majiwa <span className="text-orange-400">Admin</span>
            </span>
            <span className="badge hidden bg-orange-500/20 text-orange-300 sm:inline-flex">
              <ShieldCheck className="h-3 w-3" /> Restricted
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            <Store className="h-4 w-4" /> View Store
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex flex-row gap-1 overflow-x-auto rounded-2xl bg-white/5 p-2 no-scrollbar lg:sticky lg:top-24 lg:flex-col">
            {LINKS.map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-orange-500 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
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
