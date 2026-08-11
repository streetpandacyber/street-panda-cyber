"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error(
        "Authentication is not configured yet. Add your Supabase credentials."
      );
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset link sent — check your inbox 📬");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium !rounded-3xl p-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
        🔑
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-navy-800">
        Reset your password
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Enter your account email and we&apos;ll send you a reset link.
      </p>

      {sent ? (
        <div className="mt-6 rounded-2xl bg-neon-50 p-5 text-sm text-neon-700">
          ✅ If an account exists for <strong>{email}</strong>, a reset link is
          on its way. Didn&apos;t get it? Check spam or{" "}
          <button onClick={() => setSent(false)} className="underline">
            try again
          </button>
          .
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <KeyRound className="h-5 w-5" />
            )}
            Send Reset Link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-orange-600 hover:underline">
          Back to Sign in
        </Link>
      </p>
    </div>
  );
}
