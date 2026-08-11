"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/components/dashboard/useDashboard";

export default function ProfilePage() {
  const { configured, loading, user, profile } = useDashboard();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "Kenya",
    city: "",
    bio: "",
    newsletter_subscribed: true,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        country: profile.country ?? "Kenya",
        city: profile.city ?? "",
        bio: profile.bio ?? "",
        newsletter_subscribed: profile.newsletter_subscribed ?? true,
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="animate-pulse text-3xl">⏳</span>
      </div>
    );
  }

  if (!configured || !user) {
    return (
      <div className="card-premium p-10 text-center text-sm text-gray-500">
        Sign in with a configured account to manage your profile.
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated ✅");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">
        My Profile
      </h1>
      <p className="mt-1 text-gray-500">
        Signed in as <strong className="text-navy-800">{user.email}</strong>
      </p>

      <form onSubmit={save} className="card-premium mt-8 max-w-2xl space-y-5 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">
              Full Name
            </label>
            <input {...field("full_name")} placeholder="Jane Mwangi" className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">
              Phone
            </label>
            <input {...field("phone")} type="tel" placeholder="07XX XXX XXX" className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">
              Country
            </label>
            <input {...field("country")} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">
              City
            </label>
            <input {...field("city")} placeholder="Nairobi" className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">
            Bio
          </label>
          <textarea
            {...field("bio")}
            rows={3}
            placeholder="Tell us about yourself…"
            className="input-field resize-none"
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.newsletter_subscribed}
            onChange={(e) =>
              setForm((f) => ({ ...f, newsletter_subscribed: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
          />
          Subscribe to the weekly newsletter (free resources every Friday)
        </label>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </form>
    </div>
  );
}
