"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { Category, Product } from "@/types";
import { ProductCard } from "./ProductCard";
import {
  FilterSidebar,
  countActiveFilters,
  type MarketplaceFilters,
} from "./FilterSidebar";

type SortOption =
  | "newest"
  | "popular"
  | "rating"
  | "price-asc"
  | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  popular: "Most Popular",
  rating: "Best Rated",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

const PAGE_SIZE = 9;

interface MarketplaceBrowserProps {
  products: Product[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
}

export function MarketplaceBrowser({
  products,
  categories,
  initialQuery = "",
  initialCategory,
}: MarketplaceBrowserProps) {
  const initialCat = categories.find((c) => c.slug === initialCategory);

  const [search, setSearch] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>("popular");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    categories: initialCat ? [initialCat.id] : [],
    maxPrice: priceCeilingOf(products),
    minRating: 0,
    tags: [],
  });

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).slice(0, 18);
  }, [products]);

  const priceCeiling = priceCeilingOf(products);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.short_description?.toLowerCase().includes(s) ||
          p.tags?.some((t) => t.includes(s))
      );
    }
    if (filters.categories.length > 0) {
      list = list.filter((p) =>
        p.category_id ? filters.categories.includes(p.category_id) : false
      );
    }
    if (filters.maxPrice < priceCeiling) {
      list = list.filter((p) => (p.sale_price ?? p.price) <= filters.maxPrice);
    }
    if (filters.minRating > 0) {
      list = list.filter((p) => (p.average_rating ?? 0) >= filters.minRating);
    }
    if (filters.tags.length > 0) {
      list = list.filter((p) =>
        filters.tags.every((t) => p.tags?.includes(t))
      );
    }

    switch (sort) {
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "popular":
        list.sort((a, b) => b.total_sales - a.total_sales);
        break;
      case "rating":
        list.sort(
          (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)
        );
        break;
      case "price-asc":
        list.sort(
          (a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price)
        );
        break;
      case "price-desc":
        list.sort(
          (a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price)
        );
        break;
    }
    return list;
  }, [products, search, filters, sort, priceCeiling]);

  const activeCount = countActiveFilters(filters, priceCeiling);
  const shown = filtered.slice(0, visible);

  const chips: { label: string; clear: () => void }[] = [
    ...filters.categories.map((id) => ({
      label: categories.find((c) => c.id === id)?.name ?? id,
      clear: () =>
        setFilters((f) => ({
          ...f,
          categories: f.categories.filter((c) => c !== id),
        })),
    })),
    ...(filters.maxPrice < priceCeiling
      ? [
          {
            label: `Under KES ${filters.maxPrice.toLocaleString()}`,
            clear: () => setFilters((f) => ({ ...f, maxPrice: priceCeiling })),
          },
        ]
      : []),
    ...(filters.minRating > 0
      ? [
          {
            label: `${filters.minRating}+ stars`,
            clear: () => setFilters((f) => ({ ...f, minRating: 0 })),
          },
        ]
      : []),
    ...filters.tags.map((tag) => ({
      label: `#${tag}`,
      clear: () =>
        setFilters((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) })),
    })),
  ];

  const filterSidebar = (
    <FilterSidebar
      categories={categories}
      allTags={allTags}
      priceCeiling={priceCeiling}
      filters={filters}
      onChange={(f) => {
        setFilters(f);
        setVisible(PAGE_SIZE);
      }}
    />
  );

  return (
    <div className="container-custom py-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-navy-800 md:text-4xl">
            Marketplace
          </h1>
          <p className="mt-1 text-gray-500">
            {filtered.length} premium digital product
            {filtered.length === 1 ? "" : "s"} — instant download, lifetime
            access.
          </p>
        </div>
      </div>

      {/* Search + sort row */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search products…"
            className="input-field !pl-11"
            aria-label="Search products"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="input-field !w-auto appearance-none !py-3 pr-10 text-sm font-medium"
              aria-label="Sort products"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-secondary !px-4 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && <span className="badge-orange">{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={chip.clear}
              className="badge-navy cursor-pointer transition-colors hover:bg-red-50 hover:text-red-600"
            >
              {chip.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={() =>
              setFilters({
                categories: [],
                maxPrice: priceCeiling,
                minRating: 0,
                tags: [],
              })
            }
            className="text-xs font-medium text-gray-500 underline hover:text-red-500"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Grid + sidebar */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="card-premium sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
            {filterSidebar}
          </div>
        </aside>

        <div>
          {shown.length === 0 ? (
            <div className="card-premium flex flex-col items-center gap-3 p-16 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="text-lg font-bold text-navy-800">
                No products found
              </h3>
              <p className="max-w-sm text-sm text-gray-500">
                Try adjusting your search or clearing some filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {visible < filtered.length && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="btn-secondary"
              >
                Load More ({filtered.length - visible} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-soft-xl lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy-800">Filters</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="btn-ghost !p-2"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterSidebar}
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-primary mt-8 w-full"
              >
                Show {filtered.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function priceCeilingOf(products: Product[]): number {
  const max = Math.max(0, ...products.map((p) => p.sale_price ?? p.price));
  return Math.ceil(max / 100) * 100 || 5000;
}
