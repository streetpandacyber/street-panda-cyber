"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Menu, ShoppingBag, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Store", href: "/marketplace", icon: ShoppingBag },
  { label: "Cart", href: null, icon: ShoppingCart, cart: true },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Menu", href: "/about", icon: Menu },
];

export function StickyBottomNav() {
  const pathname = usePathname();
  const { items, openCart } = useCartStore();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="glass border-t border-white/20 shadow-[0_-4px_24px_rgba(26,41,128,0.10)]">
        <nav className="flex items-stretch justify-around px-1 py-1.5">
          {LINKS.map((link) => {
            const active =
              !link.cart &&
              link.href !== undefined &&
              (link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href));

            if (link.cart) {
              return (
                <button
                  key={link.label}
                  onClick={openCart}
                  className="relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-gray-500"
                  aria-label="Open cart"
                >
                  <span className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {items.length > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                        {items.length}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-medium">{link.label}</span>
                </button>
              );
            }

            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href ?? "/"}
                className={cn(
                  "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-colors",
                  active ? "text-orange-600" : "text-gray-500"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
