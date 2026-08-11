"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MOCK_PRODUCTS } from "@/lib/data/mock";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter((p) => p.title.toLowerCase().includes(s));
  }, [products, search]);

  const toggleSelect = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));

  const removeSelected = () => {
    setProducts((p) => p.filter((x) => !selected.includes(x.id)));
    toast.success(`${selected.length} product(s) removed (demo)`);
    setSelected([]);
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white md:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {filtered.length} product{filtered.length === 1 ? "" : "s"} in catalog
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary shrink-0">
          <PlusCircle className="h-4 w-4" /> Add New Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-orange-400"
          />
        </div>
        {selected.length > 0 && (
          <button
            onClick={removeSelected}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/30"
          >
            <Trash2 className="h-4 w-4" /> Delete {selected.length} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                    aria-label="Select all"
                  />
                </th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Sales</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-400"
                      aria-label={`Select ${p.title}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
                        {p.thumbnail_url ? (
                          <Image
                            src={p.thumbnail_url}
                            alt={p.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xl">
                            📦
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{p.title}</p>
                        <p className="text-xs text-white/40">
                          {p.category?.name ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {formatPrice(p.sale_price ?? p.price, p.currency)}
                    {p.sale_price !== undefined && (
                      <span className="ml-1.5 text-xs text-white/40 line-through">
                        {formatPrice(p.price, p.currency)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {p.total_sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={cn(
                          "badge",
                          p.is_published
                            ? "bg-neon-500/20 text-neon-300"
                            : "bg-white/10 text-white/50"
                        )}
                      >
                        {p.is_published ? "Published" : "Draft"}
                      </span>
                      {p.is_featured && (
                        <span className="badge bg-orange-500/20 text-orange-300">
                          Featured
                        </span>
                      )}
                      {p.is_best_seller && (
                        <span className="badge bg-yellow-500/20 text-yellow-300">
                          Best Seller
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Link
                        href={`/products/${p.slug}`}
                        className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="View product"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() =>
                          toast.info("Full editing UI ships with Supabase CMS mode.")
                        }
                        className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
