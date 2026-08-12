"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [noSession, setNoSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The recovery link lands here with tokens in the URL hash — the Supabase
  // browser client picks them up and establishes the recovery session.
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError("Authentication is not configured yet.");
      return;
    }
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
      else setNoSession(true);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw new Error(err.message);
      toast.success("Password updated — sign in with your new password ✅");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium !rounded-3xl p-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-50">
        <ShieldCheck className="h-7 w-7 text-neon-600" />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-navy-800">Set a new password</h1>
      <p className="mt-1 text-sm text-gray-500">
        Choose a strong password you haven&apos;t used before.
      </p>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {noSession ? (
        <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-700">
          This reset link is invalid or has expired. Request a fresh one from
          the{" "}
          <Link href="/forgot-password" className="font-bold underline">
            forgot password page
          </Link>
          .
        </div>
      ) : !ready ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifying your reset link…
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="input-field"
            />
            <PasswordStrength password={password} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className="input-field"
            />
            {confirm && confirm !== password && (
              <p className="mt-1 text-xs font-semibold text-red-500">Passwords don&apos;t match</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}
