"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Subscription failed");
      setDone(true);
      toast.success("Subscribed! Check your inbox for your free gift 🎁");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className="rounded-xl bg-neon-100 px-4 py-3 text-sm font-semibold text-neon-700">
        ✅ You&apos;re in! Your free AI prompt pack is on its way to {email}.
      </p>
    );
  }

  return (
    <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className={
          compact
            ? "w-full rounded-xl border-2 border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none transition-colors focus:border-orange-400"
            : "input-field"
        }
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary shrink-0 !px-4"
        aria-label="Subscribe to newsletter"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Subscribe</span>
      </button>
    </form>
  );
}
