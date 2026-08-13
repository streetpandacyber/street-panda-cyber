"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace", dropdown: true },
  { label: "Bundles", href: "/bundles" },
  { label: "Learning Hub", href: "/learning-hub" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const MARKETPLACE_LINKS = [
  { label: "All Products", href: "/marketplace" },
  { label: "AI Prompt Packs", href: "/marketplace?category=ai-prompt-packs" },
  { label: "Canva Templates", href: "/marketplace?category=canva-templates" },
  { label: "eBooks", href: "/marketplace?category=ebooks" },
  { label: "Social Media Packs", href: "/marketplace?category=social-media-packs" },
  { label: "Digital Learning", href: "/marketplace?category=digital-learning" },
  { label: "Business Templates", href: "/marketplace?category=business-templates" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { items, openCart } = useCartStore();
  const itemCount = items.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMarketOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(
      searchQuery.trim()
        ? `/marketplace?q=${encodeURIComponent(searchQuery.trim())}`
        : "/marketplace"
    );
    setSearchQuery("");
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "glass border-b border-white/20 shadow-soft-sm"
            : "bg-white"
        )}
      >
        <nav className="container-custom flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-gradient shadow-glow-orange">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-navy-800">
              JM{" "}
              <span className="text-gradient-orange">Majiwa</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setMarketOpen(true)}
                  onMouseLeave={() => setMarketOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-navy-700",
                      pathname.startsWith("/marketplace") &&
                        "text-orange-600 hover:text-orange-600"
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        marketOpen && "rotate-180"
                      )}
                    />
                  </Link>
                  <AnimatePresence>
                    {marketOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-0 top-full w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-soft-lg"
                      >
                        {MARKETPLACE_LINKS.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-navy-700",
                    pathname === link.href &&
                      link.href !== "/" &&
                      "text-orange-600 hover:text-orange-600"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-ghost !p-2.5"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={openCart}
              className="btn-ghost relative !p-2.5"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-glow-orange"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link href="/dashboard" className="btn-ghost hidden !p-2.5 md:flex" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>

            <Link
              href="/marketplace"
              className="btn-primary hidden !px-5 !py-2.5 text-sm lg:inline-flex"
            >
              Browse Store
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className="btn-ghost !p-2.5 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/60 p-4 pt-24 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy-800">
                  Search the marketplace
                </h3>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="btn-ghost !p-2"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={submitSearch} className="flex gap-2">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try “ChatGPT prompts”, “Canva”, “KCSE”…"
                  className="input-field"
                />
                <button type="submit" className="btn-primary shrink-0">
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {["AI prompts", "Canva templates", "KCSE", "Business", "eBooks"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(
                          `/marketplace?q=${encodeURIComponent(tag)}`
                        );
                      }}
                      className="badge-navy cursor-pointer transition-colors hover:bg-navy-200"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white shadow-soft-xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <span className="text-lg font-extrabold text-navy-800">
                  JM <span className="text-gradient-orange">Majiwa</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost !p-2"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600",
                      pathname === link.href &&
                        link.href !== "/" &&
                        "bg-orange-50 text-orange-600"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-3 border-t border-gray-100" />
                <Link
                  href="/dashboard"
                  className="block rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  My Dashboard
                </Link>
                <Link
                  href="/login"
                  className="block rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  Sign In
                </Link>
              </div>
              <div className="border-t border-gray-100 p-4">
                <Link href="/marketplace" className="btn-primary w-full">
                  Browse Store
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
