"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Mail, PartyPopper } from "lucide-react";

const CONFETTI = Array.from({ length: 24 });

export function NewsletterSection() {
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
      toast.success("Welcome aboard! Your free prompt pack is on its way 🎁");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hero-gradient relative overflow-hidden py-24 text-white">
      {/* Glow circles */}
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-neon-400/15 blur-[100px]" />

      {/* Confetti on success */}
      <AnimatePresence>
        {done && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {CONFETTI.map((_, i) => (
              <motion.span
                key={i}
                initial={{
                  y: -20,
                  x: `${(i * 41) % 100}%`,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  y: "110vh",
                  rotate: 360 * (i % 2 ? 1 : -1),
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2.5 + (i % 5) * 0.4,
                  delay: (i % 8) * 0.12,
                  ease: "easeIn",
                }}
                className="absolute top-0 block h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor: ["#f97316", "#39d353", "#facc15", "#818cf8", "#fb7185"][i % 5],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="container-custom relative text-center"
      >
        <span className="badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold">
          <Mail className="h-3.5 w-3.5 text-orange-400" />
          Weekly Newsletter
        </span>
        <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
          Get Free AI Resources <span className="text-gradient-orange">Every Week</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Join 10,000+ subscribers getting free prompts, templates and business
          tips every Friday morning. No spam, unsubscribe anytime.
        </p>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-10 max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur"
          >
            <PartyPopper className="mx-auto h-12 w-12 text-neon-400" />
            <h3 className="mt-4 text-2xl font-bold">You&apos;re subscribed! 🎉</h3>
            <p className="mt-2 text-white/70">
              Check your inbox — your FREE AI Prompt Pack is waiting for you.
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={subscribe}
            className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border-2 border-white/15 bg-white/10 px-5 py-4 text-white placeholder-white/40 outline-none backdrop-blur transition-colors focus:border-orange-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary shrink-0 !px-8 !py-4"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Subscribe Free"
              )}
            </button>
          </form>
        )}

        <p className="mt-5 text-sm font-semibold text-neon-300">
          🎁 Get a FREE AI Prompt Pack just for joining!
        </p>
        <p className="mt-2 text-xs text-white/40">
          We respect your privacy. Your email is never shared with third parties.
        </p>
      </motion.div>
    </section>
  );
}
