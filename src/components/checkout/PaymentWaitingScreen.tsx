"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { MpesaLogo } from "./MpesaPaymentButton";

const TIMEOUT_SECONDS = 90;

interface PaymentWaitingScreenProps {
  phone: string;
  onTimeout: () => void;
  onCancel: () => void;
}

/** Masks 0712 345 678 → 0712XXXXXX */
function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  const local = clean.startsWith("254") ? `0${clean.slice(3)}` : clean;
  return `${local.slice(0, 4)}XXXXXX`;
}

/**
 * Full-screen animated waiting overlay with a 90-second countdown,
 * pulsing phone mock-up, tips and a cancel option.
 */
export function PaymentWaitingScreen({
  phone,
  onTimeout,
  onCancel,
}: PaymentWaitingScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Waiting for M-Pesa payment"
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-soft-xl"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Cancel payment"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Animated phone with M-Pesa popup */}
        <div className="relative mx-auto h-44 w-28">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-full w-full flex-col items-center rounded-[1.6rem] border-4 border-navy-800 bg-navy-50 pt-3"
          >
            <div className="h-1.5 w-10 rounded-full bg-navy-200" />
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              className="mt-3 w-20 rounded-xl bg-white p-2 shadow-soft-md"
            >
              <div className="flex justify-center">
                <MpesaLogo className="h-5 !px-2 !py-0.5" />
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded bg-gray-200" />
              <div className="mt-1 h-1.5 w-3/4 rounded bg-gray-200" />
              <div className="mx-auto mt-1.5 h-4 w-12 rounded bg-[#4caf50]" />
            </motion.div>
          </motion.div>
          {/* pulse rings */}
          <motion.span
            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 -z-10 rounded-full bg-[#4caf50]/30"
          />
        </div>

        <h2 className="mt-6 text-2xl font-extrabold text-navy-800">
          Check your phone! 📱
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          We sent an M-Pesa request to{" "}
          <strong className="text-navy-800">{maskPhone(phone)}</strong>
        </p>

        {/* Pulsing dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="h-2.5 w-2.5 rounded-full bg-[#4caf50]"
            />
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-gray-600">
          Waiting for payment confirmation…
        </p>

        {/* Progress + countdown */}
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-[#4caf50]"
              initial={{ width: "100%" }}
              animate={{ width: `${(secondsLeft / TIMEOUT_SECONDS) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
          <p className="mt-2 text-xs font-bold tabular-nums text-gray-500">
            ⏱ {mm}:{ss} until timeout
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-left">
          <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Lightbulb className="h-3.5 w-3.5" /> Tips
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-amber-700/90">
            <li>• Make sure your M-Pesa is active</li>
            <li>• Enter your M-Pesa PIN when prompted</li>
            <li>• Low balance? Try a different line</li>
          </ul>
        </div>

        <button
          onClick={onCancel}
          className="mt-5 text-sm font-medium text-gray-400 underline transition-colors hover:text-red-500"
        >
          Cancel this payment
        </button>
      </motion.div>
    </motion.div>
  );
}
