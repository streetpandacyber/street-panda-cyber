"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Dices, Pencil, PlusCircle, Power, Trash2, X } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, PageHeader, StatusPill, inputCls, labelCls, selectCls } from "@/components/admin/ui";

interface CouponRow {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order: number;
  maximum_discount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  is_active: boolean;
  expires_at?: string | null;
}

const EMPTY: Omit<CouponRow, "id" | "usage_count"> = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  minimum_order: 0,
  usage_limit: null,
  is_active: true,
  expires_at: null,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { editing?: CouponRow }>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.data ?? []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setModal({});
  };
  const openEdit = (c: CouponRow) => {
    setForm({ ...EMPTY, ...c });
    setModal({ editing: c });
  };

  const save = async () => {
    if (!form.code.trim()) return toast.error("Coupon code is required");
    const body = {
      ...form,
      code: form.code.toUpperCase(),
      expires_at: form.expires_at || undefined,
      usage_limit: form.usage_limit ?? undefined,
    };
    try {
      const res = await fetch(
        modal?.editing ? `/api/admin/coupons?id=${modal.editing.id}` : "/api/admin/coupons",
        {
          method: modal?.editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(modal?.editing ? "Coupon updated" : `Coupon ${body.code} created 🎟️`);
      setModal(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const toggleActive = async (c: CouponRow) => {
    await fetch(`/api/admin/coupons?id=${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    toast.success(`${c.code} ${c.is_active ? "deactivated" : "activated"}`);
    load();
  };

  const remove = async (c: CouponRow) => {
    await fetch(`/api/admin/coupons?id=${c.id}`, { method: "DELETE" });
    toast.success(`${c.code} deleted`);
    load();
  };

  const generate = () => {
    const code = `JM-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;
    setForm((f) => ({ ...f, code }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        subtitle="Create and manage discount codes"
        action={
          <button onClick={openCreate} className="btn-primary">
            <PlusCircle className="h-4 w-4" /> Create Coupon
          </button>
        }
      />

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-4 font-semibold">Code</th>
                <th className="px-5 py-4 font-semibold">Discount</th>
                <th className="px-5 py-4 font-semibold">Min order</th>
                <th className="px-5 py-4 font-semibold">Used / Limit</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Expiry</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-white/40">Loading coupons…</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-white/40">No coupons yet — create your first one!</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 font-extrabold tracking-wide text-white">
                        {c.code}
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(c.code);
                            toast.success(`${c.code} copied`);
                          }}
                          className="rounded p-1 text-white/30 hover:bg-white/10 hover:text-white"
                          aria-label={`Copy ${c.code}`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-neon-300">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{formatPrice(c.minimum_order)}</td>
                    <td className="px-5 py-3.5 text-white/60">
                      {c.usage_count} / {c.usage_limit ?? "∞"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={c.is_active ? "published" : "draft"} />
                    </td>
                    <td className="px-5 py-3.5 text-white/50">
                      {c.expires_at ? formatDate(c.expires_at) : "Never"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleActive(c)} className="rounded-lg p-2 text-white/40 hover:bg-yellow-500/20 hover:text-yellow-300" title={c.is_active ? "Deactivate" : "Activate"}>
                          <Power className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(c)} className="rounded-lg p-2 text-white/40 hover:bg-red-500/20 hover:text-red-300" title="Delete">
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
      </Card>

      {/* create/edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-navy-900 p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white">
                {modal.editing ? `Edit ${modal.editing.code}` : "Create Coupon"}
              </h2>
              <button onClick={() => setModal(null)} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Code</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="WELCOME20" className={inputCls} />
                  <button onClick={generate} className="btn-secondary shrink-0 !px-3" title="Generate random code">
                    <Dices className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as "percentage" | "fixed" }))} className={selectCls}>
                    <option value="percentage" className="bg-navy-900">Percentage %</option>
                    <option value="fixed" className="bg-navy-900">Fixed KES</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Value</label>
                  <input type="number" min={1} value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Minimum order (KES)</label>
                  <input type="number" min={0} value={form.minimum_order} onChange={(e) => setForm((f) => ({ ...f, minimum_order: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Usage limit</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usage_limit ?? ""}
                    placeholder="Unlimited"
                    onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value ? Number(e.target.value) : null }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Expiry date</label>
                <input
                  type="date"
                  value={form.expires_at ? form.expires_at.slice(0, 10) : ""}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  className={inputCls}
                />
              </div>
              <label className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span className="text-sm font-medium text-white/80">Active</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_active}
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.is_active ? "bg-neon-500" : "bg-white/15"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form.is_active ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </label>
              <button onClick={save} className="btn-primary w-full">
                {modal.editing ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
