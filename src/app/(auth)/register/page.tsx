"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { isValidPhone } from "@/lib/utils";

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

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.phone && !isValidPhone(form.phone)) {
      toast.error("Enter a valid Kenyan phone number");
      return;
    }
    if (!terms) {
      toast.error("Please accept the Terms of Service");
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error(
        "Authentication is not configured yet. Add your Supabase credentials."
      );
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            newsletter_subscribed: newsletter,
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        toast.success("Account created — welcome to JM Majiwa! 🎉");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.success("Check your email to confirm your account ✅");
        router.push("/login");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium !rounded-3xl p-8">
      <h1 className="text-2xl font-extrabold text-navy-800">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Track orders, re-download purchases and unlock member perks.
      </p>

      <form onSubmit={register} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">
            Full Name
          </label>
          <input
            required
            value={form.full_name}
            onChange={update("full_name")}
            placeholder="Jane Mwangi"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-800">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="07XX XXX XXX"
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={update("password")}
              placeholder="Min. 8 characters"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={update("confirm")}
              placeholder="Repeat password"
              className="input-field"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-orange-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="font-semibold text-orange-600 hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
          />
          <span>
            Send me free AI resources and weekly tips 🎁 (unsubscribe anytime)
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UserPlus className="h-5 w-5" />
          )}
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-orange-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
