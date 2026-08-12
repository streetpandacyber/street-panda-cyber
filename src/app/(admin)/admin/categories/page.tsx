"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, PlusCircle, Trash2, X } from "lucide-react";
import type { Category } from "@/types";
import { Card, PageHeader, inputCls, labelCls } from "@/components/admin/ui";

type CatRow = Category & { product_count?: number };

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<CatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { editing?: CatRow }>(null);
  const [form, setForm] = useState({ name: "", icon: "🛍️", color: "orange", description: "", is_featured: false });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setRows(data.data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    try {
      const res = await fetch(
        modal?.editing ? `/api/admin/categories?id=${modal.editing.id}` : "/api/admin/categories",
        {
          method: modal?.editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Category saved");
      setModal(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organise your catalogue"
        action={
          <button
            onClick={() => {
              setForm({ name: "", icon: "🛍️", color: "orange", description: "", is_featured: false });
              setModal({});
            }}
            className="btn-primary"
          >
            <PlusCircle className="h-4 w-4" /> Add Category
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <p className="text-white/40">Loading…</p>
        ) : (
          rows.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{c.icon}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setForm({ name: c.name, icon: c.icon ?? "🛍️", color: c.color ?? "orange", description: c.description ?? "", is_featured: c.is_featured });
                      setModal({ editing: c });
                    }}
                    className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/categories?id=${c.id}`, { method: "DELETE" });
                      toast.success(`${c.name} deleted`);
                      load();
                    }}
                    className="rounded-lg p-2 text-white/40 hover:bg-red-500/20 hover:text-red-300"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 font-bold text-white">{c.name}</p>
              <p className="text-xs text-white/40">/{c.slug}</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-2.5 py-1 font-bold text-white/60">{c.product_count ?? 0} products</span>
                {c.is_featured && <span className="rounded-full bg-orange-500/15 px-2.5 py-1 font-bold text-orange-300">Featured</span>}
              </div>
            </Card>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-navy-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white">{modal.editing ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setModal(null)} className="rounded-lg p-2 text-white/40 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <div><label className={labelCls}>Name</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Icon (emoji)</label><input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Color</label><input value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Description</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} /></div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="h-4 w-4 rounded bg-white/10 text-orange-500" />
                Featured on homepage
              </label>
              <button onClick={save} className="btn-primary w-full">Save Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
