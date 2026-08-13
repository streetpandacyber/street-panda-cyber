"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { isValidPhone } from "@/lib/utils";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.phone && !isValidPhone(form.phone)) return setError("Enter a valid Kenyan phone number.");
    if (!terms) return setError("Please accept the Terms of Service to continue.");
    if (!isSupabaseConfigured()) {
      return setError("Authentication is not configured yet. Add your Supabase credentials first.");
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            newsletter_subscribed: newsletter,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
      if (err) throw new Error(err.message);

      if (data.session) {
        // Auto-confirm projects: straight in
        toast.success("Account created — welcome to JM Majiwa! 🎉");
        router.push("/dashboard");
        router.refresh();
      } else {
        // Confirmation email sent (profile row is created by DB trigger)
        router.push(`/verify?email=${encodeURIComponent(form.email)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium !rounded-3xl p-8">
      <h1 className="text-2xl font-extrabold text-navy-800">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Track orders, re-download purchases and unlock member perks.
      </p>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={register} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">Full Name</label>
          <input required value={form.full_name} onChange={update("full_name")} placeholder="Jane Mwangi" className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">Email</label>
          <input type="email" required value={form.email} onChange={update("email")} placeholder="you@example.com" className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">Phone (optional)</label>
          <input type="tel" value={form.phone} onChange={update("phone")} placeholder="07XX XXX XXX" className="input-field" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Password</label>
            <input type="password" required value={form.password} onChange={update("password")} placeholder="Min. 8 characters" className="input-field" />
            <PasswordStrength password={form.password} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Confirm Password</label>
            <input type="password" required value={form.confirm} onChange={update("confirm")} placeholder="Repeat password" className="input-field" />
            {form.confirm && form.confirm !== form.password && (
              <p className="mt-1 text-xs font-semibold text-red-500">Passwords don&apos;t match</p>
            )}
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-gray-600">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-orange-600 hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="font-semibold text-orange-600 hover:underline">Privacy Policy</Link>
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-sm text-gray-600">
          <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
          <span>Send me free AI resources and weekly tips 🎁 (unsubscribe anytime)</span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-orange-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
