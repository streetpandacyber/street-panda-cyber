"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Check,
  CreditCard,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, isValidPhone } from "@/lib/utils";

const detailsSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .refine(isValidPhone, "Enter a valid Kenyan number (07XX... or +2547XX...)"),
});

type Details = z.infer<typeof detailsSchema>;

const STEPS = [
  { n: 1, label: "Details", icon: User },
  { n: 2, label: "Payment", icon: CreditCard },
  { n: 3, label: "Download", icon: Check },
];

type PayState = "idle" | "creating" | "prompting" | "waiting" | "demo";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, discount, couponCode, clearCart } =
    useCartStore();

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<Details | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [payState, setPayState] = useState<PayState>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const subtotal = getSubtotal();
  const total = getTotal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Details>({ resolver: zodResolver(detailsSchema) });

  useEffect(() => {
    if (details) setMpesaPhone(details.phone);
  }, [details]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Empty cart guard
  useEffect(() => {
    if (items.length === 0 && step === 1) {
      // allow render so empty state shows
    }
  }, [items.length, step]);

  const onDetailsSubmit = (data: Details) => {
    setDetails(data);
    setStep(2);
  };

  const saveSummary = (orderNumber: string) => {
    try {
      sessionStorage.setItem(
        "jm-checkout-summary",
        JSON.stringify({
          orderNumber,
          total,
          items: items.map((i) => ({
            title: i.product.title,
            price: i.product.sale_price ?? i.product.price,
          })),
        })
      );
    } catch {
      /* storage unavailable */
    }
  };

  const pollStatus = (orderId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mpesa/status?order_id=${orderId}`);
        const data = await res.json();
        if (data.payment_status === "paid") {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.success("Payment confirmed! 🎉");
          saveSummary(data.order_number ?? "");
          clearCart();
          router.push(
            `/checkout/success?order=${encodeURIComponent(data.order_number ?? "")}`
          );
        } else if (data.payment_status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setPayState("idle");
          toast.error("Payment was not completed. Please try again.");
        }
      } catch {
        /* keep polling */
      }
    }, 5000);
  };

  const payWithMpesa = async () => {
    if (!details) return;
    if (!isValidPhone(mpesaPhone)) {
      toast.error("Enter a valid Kenyan phone number for M-Pesa");
      return;
    }

    setPayState("creating");
    try {
      // 1. Create the order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: details.full_name,
          customer_email: details.email,
          customer_phone: details.phone,
          coupon_code: couponCode ?? undefined,
          items: items.map((i) => ({
            product_id: i.product.id,
            title: i.product.title,
            price: i.product.sale_price ?? i.product.price,
            quantity: i.quantity,
          })),
        }),
      });
      const order = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        throw new Error(order.error ?? "Could not create order");
      }

      // Demo mode: no Supabase configured
      if (order.demo) {
        setPayState("demo");
        saveSummary(order.order_number);
        toast.info(
          "Demo mode: connect Supabase + M-Pesa env vars to process real payments."
        );
        return;
      }

      // 2. Trigger STK push
      setPayState("prompting");
      const stkRes = await fetch("/api/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          phone: mpesaPhone,
        }),
      });
      const stk = await stkRes.json().catch(() => ({}));
      if (!stkRes.ok || !stk.success) {
        throw new Error(stk.error ?? "Could not start M-Pesa payment");
      }

      // 3. Poll for payment status every 5 seconds
      setPayState("waiting");
      toast.success("M-Pesa prompt sent — check your phone 📱");
      pollStatus(order.id);
    } catch (err) {
      setPayState("idle");
      toast.error(
        err instanceof Error ? err.message : "Payment failed. Please try again."
      );
    }
  };

  const simulateDemoSuccess = () => {
    const summary = sessionStorage.getItem("jm-checkout-summary");
    const orderNumber = summary
      ? (JSON.parse(summary).orderNumber as string)
      : "JMM-DEMO";
    clearCart();
    router.push(
      `/checkout/success?order=${encodeURIComponent(orderNumber)}`
    );
  };

  if (items.length === 0) {
    return (
      <div className="container-custom flex flex-col items-center gap-5 py-32 text-center">
        <span className="text-6xl">🧺</span>
        <h1 className="text-2xl font-extrabold text-navy-800">
          Nothing to check out yet
        </h1>
        <p className="max-w-md text-gray-500">
          Add some products to your cart first — they download instantly after
          payment.
        </p>
        <Link href="/marketplace" className="btn-primary">
          Browse the Marketplace
        </Link>
      </div>
    );
  }

  const paying = payState === "creating" || payState === "prompting" || payState === "waiting";

  return (
    <div className="container-custom py-12">
      {/* Step indicator */}
      <div className="mx-auto flex max-w-xl items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.n;
          const active = step === s.n;
          return (
            <div key={s.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-neon-500 bg-neon-500 text-white"
                      : active
                        ? "border-orange-500 bg-orange-500 text-white shadow-glow-orange"
                        : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    active ? "text-orange-600" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded ${
                    step > s.n ? "bg-neon-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {/* STEP 1 — details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-navy-800">Your Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                We send your download links and receipt to this email.
              </p>
              <form
                onSubmit={handleSubmit(onDetailsSubmit)}
                className="mt-6 space-y-5"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy-800">
                    Full Name
                  </label>
                  <input
                    {...register("full_name")}
                    placeholder="e.g. Jane Mwangi"
                    className="input-field"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy-800">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="input-field"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy-800">
                    Phone Number
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="07XX XXX XXX"
                    className="input-field"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full !py-4">
                  Continue to Payment
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2 — M-Pesa payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-6 md:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-50 text-2xl">
                  📲
                </span>
                <div>
                  <h2 className="text-xl font-bold text-navy-800">
                    Pay with M-Pesa
                  </h2>
                  <p className="text-sm text-gray-500">
                    Powered by Safaricom Daraja — safe &amp; instant
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-semibold text-navy-800">
                  M-Pesa Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center gap-1.5 rounded-l-xl border-2 border-r-0 border-gray-200 bg-gray-50 px-4 text-sm font-bold text-navy-800">
                    🇰🇪 +254
                  </span>
                  <input
                    value={mpesaPhone.startsWith("+254") ? mpesaPhone.slice(4) : mpesaPhone.startsWith("0") ? mpesaPhone.slice(1) : mpesaPhone}
                    onChange={(e) => setMpesaPhone(`0${e.target.value.replace(/\D/g, "")}`)}
                    type="tel"
                    placeholder="7XX XXX XXX"
                    disabled={paying}
                    className="input-field !rounded-l-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-navy-50 px-5 py-4">
                <span className="text-sm font-semibold text-navy-700">
                  Amount to pay
                </span>
                <span className="text-2xl font-extrabold text-navy-800">
                  {formatPrice(total)}
                </span>
              </div>

              {payState === "demo" && (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800">
                  <p className="font-bold">🧪 Demo mode active</p>
                  <p className="mt-1">
                    Supabase &amp; M-Pesa credentials are not configured, so no
                    real payment can be processed. Add your environment
                    variables to enable live payments — or simulate the flow:
                  </p>
                  <button
                    onClick={simulateDemoSuccess}
                    className="btn-primary mt-3 !py-2.5 text-sm"
                  >
                    Simulate Payment Success
                  </button>
                </div>
              )}

              {payState === "waiting" && (
                <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-neon-50 p-6 text-center">
                  <span className="relative flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-400 opacity-75" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-neon-500" />
                  </span>
                  <p className="font-bold text-navy-800">
                    Waiting for your M-Pesa confirmation…
                  </p>
                  <p className="text-sm text-gray-500">
                    Enter your M-Pesa PIN on your phone. Checking status every 5
                    seconds.
                  </p>
                </div>
              )}

              <button
                onClick={payWithMpesa}
                disabled={paying}
                className="btn-primary mt-6 w-full !py-4"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {payState === "waiting"
                      ? "Waiting for payment…"
                      : "Sending M-Pesa prompt…"}
                  </>
                ) : (
                  <>
                    <Smartphone className="h-5 w-5" />
                    Pay {formatPrice(total)} with M-Pesa
                  </>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
                <Phone className="h-3.5 w-3.5" />
                You will receive an M-Pesa prompt on your phone — enter your PIN
                to complete.
              </p>

              <button
                onClick={() => setStep(1)}
                disabled={paying}
                className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:text-navy-700"
              >
                ← Back to details
              </button>
            </motion.div>
          )}
        </div>

        {/* Order summary sidebar */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card-premium p-6">
            <h3 className="text-lg font-bold text-navy-800">Order Summary</h3>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="line-clamp-1 text-gray-600">
                    {item.product.title}
                  </span>
                  <span className="shrink-0 font-semibold text-navy-800">
                    {formatPrice(item.product.sale_price ?? item.product.price)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-neon-600">
                  <span>Discount {couponCode ? `(${couponCode})` : ""}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-lg font-extrabold text-navy-800">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
              <p className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-neon-500" /> SSL-encrypted
                checkout
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-500" /> 30-day
                money-back guarantee
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
