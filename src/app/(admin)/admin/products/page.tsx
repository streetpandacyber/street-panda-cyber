"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import type { Category, Product } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, PageHeader, StatusPill, inputCls, selectCls } from "@/components/admin/ui";

const PAGE_SIZE = 20;

interface Filters {
  search: string;
  category: string;
  status: string;
  sort: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    status: "",
    sort: "newest",
  });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, featured: 0, draft: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (filters.search) sp.set("search", filters.search);
      if (filters.category) sp.set("category", filters.category);
      if (filters.status) sp.set("status", filters.status);
      if (filters.sort) sp.set("sort", filters.sort);
      const res = await fetch(`/api/admin/products?${sp}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProducts(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const [cats, all, pub, feat, draft] = await Promise.all([
          fetch("/api/admin/categories").then((r) => r.json()),
          fetch("/api/admin/products?limit=1").then((r) => r.json()),
          fetch("/api/admin/products?status=published&limit=1").then((r) => r.json()),
          fetch("/api/admin/products?status=featured&limit=1").then((r) => r.json()),
          fetch("/api/admin/products?status=draft&limit=1").then((r) => r.json()),
        ]);
        setCategories(cats.data ?? []);
        setStats({
          total: all.pagination?.total ?? 0,
          published: pub.pagination?.total ?? 0,
          featured: feat.pagination?.total ?? 0,
          draft: draft.pagination?.total ?? 0,
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulkUpdate = async (updates: Record<string, unknown>, label: string) => {
    try {
      await Promise.all(
        selected.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })
        )
      );
      toast.success(`${label} — ${selected.length} product(s)`);
      setSelected([]);
      load();
    } catch {
      toast.error("Bulk update failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${total} product${total === 1 ? "" : "s"} in catalog`}
        action={
          <Link href="/admin/products/new" className="btn-primary shrink-0">
            <PlusCircle className="h-4 w-4" /> Add New Product
          </Link>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Published", value: stats.published, color: "text-neon-300" },
          { label: "Featured", value: stats.featured, color: "text-orange-300" },
          { label: "Drafts", value: stats.draft, color: "text-white/50" },
        ].map((s) => (
          <Card key={s.label} className="!p-4">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_repeat(3,160px)]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={filters.search}
              onChange={(e) => {
                setFilters((f) => ({ ...f, search: e.target.value }));
                setPage(1);
              }}
              placeholder="Search by title or tag…"
              className={inputCls + " !pl-10"}
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => {
              setFilters((f) => ({ ...f, category: e.target.value }));
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="" className="bg-navy-900">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-navy-900">
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="" className="bg-navy-900">All Status</option>
            <option value="published" className="bg-navy-900">Published</option>
            <option value="draft" className="bg-navy-900">Draft</option>
            <option value="featured" className="bg-navy-900">Featured</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className={selectCls}
          >
            <option value="newest" className="bg-navy-900">Newest</option>
            <option value="oldest" className="bg-navy-900">Oldest</option>
            <option value="price-desc" className="bg-navy-900">Price High–Low</option>
            <option value="price-asc" className="bg-navy-900">Price Low–High</option>
            <option value="sales" className="bg-navy-900">Most Sales</option>
          </select>
        </div>
      </Card>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3">
          <span className="text-sm font-bold text-orange-300">
            {selected.length} selected
          </span>
          <button onClick={() => bulkUpdate({ is_published: true }, "Published")} className="btn-secondary !px-3 !py-1.5 !text-xs">
            Publish
          </button>
          <button onClick={() => bulkUpdate({ is_published: false }, "Unpublished")} className="btn-secondary !px-3 !py-1.5 !text-xs">
            Unpublish
          </button>
          <button onClick={() => bulkUpdate({ is_featured: true }, "Featured")} className="btn-secondary !px-3 !py-1.5 !text-xs">
            Feature
          </button>
          <button onClick={() => bulkUpdate({ is_published: false, is_featured: false }, "Deleted (soft)")} className="rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/30">
            Delete
          </button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-white/50 underline">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selected.length === products.length && products.length > 0}
                    onChange={() =>
                      setSelected(selected.length === products.length ? [] : products.map((p) => p.id))
                    }
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-orange-500"
                    aria-label="Select all"
                  />
                </th>
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Sales</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Badges</th>
                <th className="px-5 py-4 font-semibold">Date added</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-white/40">
                    Loading products…
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-orange-500"
                        aria-label={`Select ${p.title}`}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white/10">
                          {p.thumbnail_url ? (
                            <Image src={p.thumbnail_url} alt={p.title} fill sizes="44px" className="object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center">📦</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold text-white">{p.title}</p>
                          <p className="text-xs text-white/40">{p.category?.name ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/80">
                      {formatPrice((p.sale_price ?? p.price) as number)}
                      {p.sale_price !== undefined && (
                        <span className="ml-1.5 text-xs text-white/30 line-through">
                          {formatPrice(p.price as number)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{p.total_sales.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={p.is_published ? "published" : "draft"} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        {p.is_featured && <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-300">Featured</span>}
                        {p.is_best_seller && <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-bold text-yellow-300">Best Seller</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/50">{formatDate(p.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/products/${p.slug}`}
                          className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"
                          title="View in store"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={async () => {
                            await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
                            toast.success(`Soft-deleted “${p.title}”`);
                            load();
                          }}
                          className="rounded-lg p-2 text-white/40 hover:bg-red-500/20 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
          <p className="text-xs text-white/40">
            Page {page} of {totalPages} • {total} products
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-white/10 p-2 text-white/60 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-white/10 p-2 text-white/60 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
