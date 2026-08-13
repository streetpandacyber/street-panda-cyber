"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";
import { Card, PageHeader, inputCls, labelCls } from "@/components/admin/ui";

const DEFAULTS = {
  store_name: "JM Majiwa",
  support_email: "streetpandacyber@gmail.com",
  whatsapp: "+254745198099",
  phone: "0745198099",
  facebook: "@JM Majiwa",
  currency: "KES",
  refund_days: "30",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jm-admin-settings");
      if (saved) setForm({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {
      /* defaults */
    }
  }, []);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    try {
      localStorage.setItem("jm-admin-settings", JSON.stringify(form));
      toast.success("Store settings saved");
    } catch {
      toast.error("Could not persist settings");
    }
    setSaving(false);
  };

  const supabaseOn = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <PageHeader title="Store Settings" subtitle="Identity, contact channels and policies" />

      {/* integration status */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Supabase", on: supabaseOn, hint: supabaseOn ? "Connected" : "Add env vars to connect" },
          { label: "M-Pesa Daraja", on: false, hint: "Server env — see .env.example" },
          { label: "Resend Email", on: false, hint: "Server env — see .env.example" },
        ].map((i) => (
          <Card key={i.label} className="!p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">{i.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${i.on ? "bg-neon-400" : "bg-yellow-400"}`} />
            </div>
            <p className="mt-1 text-xs text-white/40">{i.hint}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-bold text-white">Store identity</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div><label className={labelCls}>Store name</label><input value={form.store_name} onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Currency</label><input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Support email</label><input value={form.support_email} onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>WhatsApp</label><input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Call line</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Facebook</label><input value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Refund window (days)</label><input value={form.refund_days} onChange={(e) => setForm((f) => ({ ...f, refund_days: e.target.value }))} className={inputCls} /></div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary mt-6">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </Card>
    </div>
  );
}
