"use client";

import { Loader2, Smartphone } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type PaymentState =
  | "idle"
  | "loading"
  | "waiting"
  | "success"
  | "failed"
  | "timeout";

interface MpesaPaymentButtonProps {
  amount: number;
  state: PaymentState;
  onPay: () => void;
}

/** Inline M-PESA brand mark (Safaricom green). */
export function MpesaLogo({ className = "h-8" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg bg-[#4caf50] px-3 py-1.5 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.5 13.5h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2Zm0-3.5h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2Zm0-3.5h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2Z" />
      </svg>
      <span className="text-sm font-extrabold tracking-wide text-white">
        M-PESA
      </span>
    </span>
  );
}

/**
 * Big branded pay button. All visual payment states:
 * idle | loading | waiting | success | failed | timeout
 */
export function MpesaPaymentButton({ amount, state, onPay }: MpesaPaymentButtonProps) {
  const busy = state === "loading" || state === "waiting";

  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl border-2 border-[#4caf50]/25 bg-[#4caf50]/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <MpesaLogo />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Amount to pay
            </p>
            <p className="text-2xl font-extrabold text-navy-800">
              {formatPrice(amount)}
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 text-xs font-semibold text-[#2e7d32] sm:flex">
          <Smartphone className="h-4 w-4" /> STK Push to your phone
        </span>
      </div>

      <button
        onClick={onPay}
        disabled={busy || state === "success"}
        className={`mt-4 w-full !py-4 text-base ${
          state === "success"
            ? "btn-primary !bg-neon-500"
            : state === "failed" || state === "timeout"
              ? "btn-primary"
              : "btn-primary"
        }`}
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Creating your order…
          </>
        ) : state === "waiting" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Waiting for payment…
          </>
        ) : state === "success" ? (
          <>✅ Payment Received</>
        ) : state === "failed" ? (
          <>Retry Payment — {formatPrice(amount)}</>
        ) : state === "timeout" ? (
          <>Resend M-Pesa Prompt — {formatPrice(amount)}</>
        ) : (
          <>
            <Smartphone className="h-5 w-5" /> Pay {formatPrice(amount)} with M-Pesa
          </>
        )}
      </button>
    </div>
  );
}
