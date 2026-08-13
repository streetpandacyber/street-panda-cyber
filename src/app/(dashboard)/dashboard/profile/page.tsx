"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Loader2, Lock, Save } from "lucide-react";
import { useDashboard } from "@/components/dashboard/useDashboard";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { configured, loading, user, profile } = useDashboard();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "Kenya",
    city: "",
    bio: "",
    newsletter_subscribed: true,
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setAvatar(profile.avatar_url ?? null);
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

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const uploadAvatar = async (file: File | undefined) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/account/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Avatar upload failed");
      setAvatar(data.data.url);
      toast.success("Avatar updated 📸");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw new Error(error.message);
      toast.success("Profile saved ✅");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) return toast.error("New password must be 8+ characters");
    if (pw.next !== pw.confirm) return toast.error("New passwords don't match");
    setChangingPw(true);
    try {
      const supabase = createClient();
      // Verify current password first
      const { error: reAuth } = await supabase.auth.signInWithPassword({
        email: user.email ?? "",
        password: pw.current,
      });
      if (reAuth) throw new Error("Current password is incorrect");
      const { error } = await supabase.auth.updateUser({ password: pw.next });
      if (error) throw new Error(error.message);
      setPw({ current: "", next: "", confirm: "" });
      toast.success("Password changed 🔒");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">My Profile</h1>
        <p className="mt-1 text-gray-500">Signed in as <strong className="text-navy-800">{user.email}</strong></p>
      </div>

      {/* avatar + basic form */}
      <form onSubmit={save} className="card-premium space-y-5 p-6 md:p-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-navy-600">
              {avatar ? (
                <Image src={avatar} alt="Avatar" fill sizes="80px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {getInitials(form.full_name || (user.email ?? "U"))}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-glow-orange transition-transform hover:scale-110"
              aria-label="Change avatar"
            >
              {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => uploadAvatar(e.target.files?.[0])}
            />
          </div>
          <div>
            <p className="font-bold text-navy-800">{form.full_name || "Add your name"}</p>
            <p className="text-xs text-gray-500">PNG, JPEG or WebP • max 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Full Name</label>
            <input {...field("full_name")} placeholder="Jane Mwangi" className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Email</label>
            <input value={user.email ?? ""} disabled className="input-field opacity-60" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Phone</label>
            <input {...field("phone")} type="tel" placeholder="07XX XXX XXX" className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Country</label>
            <input {...field("country")} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">City</label>
            <input {...field("city")} placeholder="Nairobi" className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">Bio</label>
          <textarea {...field("bio")} rows={3} placeholder="Tell us about yourself…" className="input-field resize-none" />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.newsletter_subscribed}
            onChange={(e) => setForm((f) => ({ ...f, newsletter_subscribed: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
          />
          Subscribed to the weekly newsletter (free resources every Friday)
        </label>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </form>

      {/* change password */}
      <form onSubmit={changePassword} className="card-premium space-y-4 p-6 md:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800">
          <Lock className="h-5 w-5 text-orange-500" /> Change Password
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Current</label>
            <input type="password" required value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">New</label>
            <input type="password" required value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Confirm new</label>
            <input type="password" required value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={changingPw} className="btn-secondary">
          {changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
