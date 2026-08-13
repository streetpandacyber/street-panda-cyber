"use client";

import { Star, X } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

export interface MarketplaceFilters {
  categories: string[];
  maxPrice: number;
  minRating: number;
  tags: string[];
}

interface FilterSidebarProps {
  categories: Category[];
  allTags: string[];
  priceCeiling: number;
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
}

export function countActiveFilters(f: MarketplaceFilters): number {
  return (
    f.categories.length +
    (f.maxPrice < Number.MAX_SAFE_INTEGER ? 1 : 0) +
    (f.minRating > 0 ? 1 : 0) +
    f.tags.length
  );
}

export function FilterSidebar({
  categories,
  allTags,
  priceCeiling,
  filters,
  onChange,
}: FilterSidebarProps) {
  const activeCount = countActiveFilters(filters);

  const toggleCategory = (id: string) => {
    const categories = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    onChange({ ...filters, categories });
  };

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-navy-800">Filters</h3>
        {activeCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="badge-orange">{activeCount} active</span>
            <button
              onClick={() =>
                onChange({
                  categories: [],
                  maxPrice: priceCeiling,
                  minRating: 0,
                  tags: [],
                })
              }
              className="flex items-center gap-1 text-xs font-medium text-gray-500 underline hover:text-red-500"
            >
              <X className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Categories
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
              />
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Max Price
        </h4>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={50}
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-orange-500"
          aria-label="Maximum price"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>KES 0</span>
          <span className="font-bold text-navy-800">
            KES {filters.maxPrice.toLocaleString()}
            {filters.maxPrice === priceCeiling ? "+" : ""}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {[4.5, 4, 3, 0].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: r })}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                filters.minRating === r
                  ? "bg-orange-50 font-semibold text-orange-600"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {r === 0 ? "Any rating" : `${r}+ stars`}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Popular Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filters.tags.includes(tag)
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
