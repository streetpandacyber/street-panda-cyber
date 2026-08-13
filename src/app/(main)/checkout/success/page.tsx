"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Mail, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Summary {
  orderNumber: string;
  total: number;
  items: { title: string; price: number }[];
}

const CONFETTI_COLORS = ["#f97316", "#39d353", "#facc15", "#818cf8", "#fb7185"];

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order") ?? "";

  const summary = useMemo<Summary | null>(() => {
    try {
      const raw = sessionStorage.getItem("jm-checkout-summary");
      return raw ? (JSON.parse(raw) as Summary) : null;
    } catch {
      return null;
    }
  }, []);

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 150);
    return () => clearTimeout(t);
  }, []);

  const orderNumber = orderParam || summary?.orderNumber || "JMM-0000";

  return (
    <div className="relative overflow-hidden">
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ y: -30, x: `${(i * 37) % 100}%`, rotate: 0, opacity: 1 }}
            animate={{
              y: "105vh",
              rotate: 360 * (i % 2 ? 1 : -1),
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 2.6 + (i % 5) * 0.4,
              delay: (i % 10) * 0.15,
              ease: "easeIn",
            }}
            className="absolute top-0 block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: CONFETTI_COLORS[i % 5] }}
          />
        ))}
      </div>

      <div className="container-custom relative flex flex-col items-center py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-neon-gradient shadow-glow-neon"
        >
          <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-3xl font-extrabold text-navy-800 md:text-5xl"
        >
          Payment Successful! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 max-w-xl text-gray-500"
        >
          Thank you for your purchase. Your digital products are ready to
          download right now.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 badge-navy !px-5 !py-2 !text-sm"
        >
          Order Number: <strong className="font-extrabold">{orderNumber}</strong>
        </motion.div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-premium mt-10 w-full max-w-2xl p-6 text-left md:p-8"
        >
          <h2 className="text-lg font-bold text-navy-800">Your Downloads</h2>
          <p className="mt-1 text-sm text-gray-500">
            Files are also available anytime in your dashboard.
          </p>
          <ul className="mt-5 space-y-3">
            {(summary?.items ?? []).length > 0 ? (
              summary!.items.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/downloads"
                    className="btn-primary shrink-0 !px-4 !py-2 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </Link>
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Your purchased items are listed in your confirmation email and
                dashboard.
              </li>
            )}
          </ul>

          <div className="mt-6 rounded-2xl bg-navy-50 p-5 text-sm text-navy-700">
            <p className="font-bold">How to download:</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-navy-600">
              <li>Click a Download button above, or visit your dashboard.</li>
              <li>Files download straight to your device — unzip if needed.</li>
              <li>Enjoy lifetime access with free updates!</li>
            </ol>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center gap-2 text-sm text-gray-500"
        >
          <Mail className="h-4 w-4 text-orange-500" />
          A confirmation email with your download links has been sent to you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link href="/marketplace" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Go to My Dashboard
          </Link>
        </motion.div>

        <button
          onClick={() =>
            toast.info("Tip: check spam/junk if the email doesn't arrive.")
          }
          className="mt-6 text-xs text-gray-400 underline hover:text-gray-600"
        >
          Didn&apos;t receive the email?
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <span className="text-4xl">⏳</span>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
