"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Check,
  CreditCard,
  Download,
  Lock,
  Mail,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  User,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { isValidPhone } from "@/lib/utils";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { DownloadCard } from "@/components/checkout/DownloadCard";
import {
  MpesaPaymentButton,
  type PaymentState,
} from "@/components/checkout/MpesaPaymentButton";
import { PaymentWaitingScreen } from "@/components/checkout/PaymentWaitingScreen";
import type { CartItem } from "@/types";

/* ── Schemas ─────────────────────────────────────────── */

const detailsSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone_digits: z
    .string()
    .refine(
      (v) => isValidPhone(`0${v.replace(/\D/g, "")}`),
      "Enter a valid Safaricom number (e.g. 712 345 678)"
    ),
});
type Details = z.infer<typeof detailsSchema>;

/* ── Step indicator ──────────────────────────────────── */

const STEPS = [
  { n: 1, label: "Your Details", icon: User },
  { n: 2, label: "Payment", icon: CreditCard },
  { n: 3, label: "Download", icon: Download },
];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mx-auto flex max-w-xl items-center">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <motion.span
                animate={active ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.5 }}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-neon-500 bg-neon-500 text-white"
                    : active
                      ? "border-orange-500 bg-orange-500 text-white shadow-glow-orange"
                      : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </motion.span>
              <span
                className={`mt-2 text-xs font-semibold ${
                  active ? "text-orange-600" : done ? "text-neon-600" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-6 h-1 flex-1 rounded-full ${
                  step > s.n ? "bg-neon-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Download item from token API ────────────────────── */

interface TokenItem {
  id: string;
  title: string;
  product_id: string | null;
  downloads_used: number;
  downloads_remaining: number;
  url: string;
  product?: {
    thumbnail_url?: string;
    file_format?: string;
    file_size?: string;
  } | null;
}

export default function CheckoutPage() {
  const { items, getSubtotal, getTotal, discount, couponCode, clearCart } =
    useCartStore();

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<Details | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);

  const [payState, setPayState] = useState<PaymentState>("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [tokenItems, setTokenItems] = useState<TokenItem[]>([]);
  const purchasedRef = useRef<CartItem[]>([]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const subtotal = getSubtotal();
  const total = getTotal();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Details>({ resolver: zodResolver(detailsSchema) });

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  const onDetailsSubmit = (data: Details) => {
    setDetails(data);
    setMpesaPhone(`0${data.phone_digits.replace(/\D/g, "")}`);
    setStep(2);
  };

  /* ── payment orchestration ─────────────────────────── */

  const handlePaid = async (token: string | null, number: string) => {
    stopPolling();
    purchasedRef.current = [...items];
    setOrderNumber(number);
    setDownloadToken(token);
    setPayState("success");

    if (token) {
      try {
        const res = await fetch(`/api/downloads/${token}`);
        const data = await res.json();
        if (res.ok) setTokenItems(data.data.items ?? []);
      } catch {
        /* cards will fall back to cart snapshot */
      }
    }

    setStep(3);
    clearCart();
    toast.success("Payment confirmed! 🎉");
  };

  const pollStatus = (id: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${id}/status`);
        const data = await res.json();
        if (data.payment_status === "paid") {
          await handlePaid(data.download_token ?? null, data.order_number ?? "");
        } else if (data.payment_status === "failed") {
          stopPolling();
          setPayState("failed");
          toast.error("Payment was not completed.");
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

    setPayState("loading");
    try {
      // 1. Create the order (reuse it on retries)
      let id = orderId;
      if (!id) {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: details.full_name,
            customer_email: details.email,
            customer_phone: mpesaPhone,
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
        if (!orderRes.ok) throw new Error(order.error ?? "Could not create order");
        id = order.id;
        setOrderId(id);
        setOrderNumber(order.order_number ?? "");

        // Demo mode (no Supabase configured)
        if (order.demo) {
          setIsDemo(true);
          setPayState("idle");
          toast.info(
            "Demo mode: connect Supabase + M-Pesa env vars for live payments."
          );
          return;
        }
      }

      if (!id) throw new Error("Could not create order");

      // 2. Trigger STK push
      const stkRes = await fetch("/api/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id, phone: mpesaPhone }),
      });
      const stk = await stkRes.json().catch(() => ({}));
      if (!stkRes.ok || !stk.success) {
        throw new Error(stk.error ?? "Could not start M-Pesa payment");
      }

      // 3. Waiting screen + 5s polling
      setPayState("waiting");
      pollStatus(id);
    } catch (err) {
      setPayState("failed");
      toast.error(
        err instanceof Error ? err.message : "Payment failed. Please try again."
      );
    }
  };

  const simulateDemoSuccess = () => {
    purchasedRef.current = [...items];
    setIsDemo(true);
    setDownloadToken(null);
    setOrderNumber((n) => n || "JMM-DEMO-0001");
    setPayState("success");
    setStep(3);
    clearCart();
  };

  const requestDownload = async (item: TokenItem) => {
    if (!downloadToken) {
      toast.info("Demo purchase — downloads activate with live payments.");
      return;
    }
    const res = await fetch(item.url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Download failed");
    window.open(data.download_url, "_blank", "noopener");
    toast.success("Download started ⬇️");
  };

  /* ── guards ────────────────────────────────────────── */

  if (items.length === 0 && step !== 3) {
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

  const successCards: TokenItem[] =
    tokenItems.length > 0
      ? tokenItems
      : purchasedRef.current.map((c) => ({
          id: c.product.id,
          title: c.product.title,
          product_id: c.product.id,
          downloads_used: 0,
          downloads_remaining: 5,
          url: "",
          product: {
            thumbnail_url: c.product.thumbnail_url,
            file_format: c.product.file_format,
            file_size: c.product.file_size,
          },
        }));

  return (
    <div className="container-custom py-12">
      <StepIndicator step={step} />

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
                    Full Name *
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
                    Email Address *
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
                    Phone Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center gap-1.5 rounded-l-xl border-2 border-r-0 border-gray-200 bg-gray-50 px-4 text-sm font-bold text-navy-800">
                      🇰🇪 +254
                    </span>
                    <input
                      {...register("phone_digits")}
                      inputMode="numeric"
                      placeholder="7XX XXX XXX"
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                        const formatted = digits
                          .replace(/^(\d{3})(\d{0,3})(\d{0,3})$/, (_m, a, b, c) =>
                            [a, b, c].filter(Boolean).join(" ")
                          );
                        e.target.value = formatted;
                        setValue("phone_digits", digits, { shouldValidate: false });
                      }}
                      className="input-field !rounded-l-none"
                    />
                  </div>
                  {errors.phone_digits && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.phone_digits.message}
                    </p>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full !py-4">
                  Continue to Payment
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2 — payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-6 md:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy-800">
                    Pay with M-Pesa
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Secure STK Push via Safaricom Daraja
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPhone((v) => !v);
                  }}
                  className="btn-ghost text-sm"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {editingPhone ? "Done" : "Edit phone"}
                </button>
              </div>

              {/* phone display / edit */}
              <div className="mt-5 rounded-2xl bg-gray-50 px-5 py-4">
                {editingPhone ? (
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-xl border-2 border-r-0 border-gray-200 bg-white px-3 text-sm font-bold text-navy-800">
                      🇰🇪 +254
                    </span>
                    <input
                      value={mpesaPhone.replace(/^0/, "")}
                      onChange={(e) =>
                        setMpesaPhone(`0${e.target.value.replace(/\D/g, "").slice(0, 9)}`)
                      }
                      className="input-field !rounded-l-none !py-2.5"
                      inputMode="numeric"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    M-Pesa prompt goes to{" "}
                    <strong className="text-navy-800">
                      +254 {mpesaPhone.replace(/^0/, "")}
                    </strong>{" "}
                    ({details?.full_name})
                  </p>
                )}
              </div>

              <div className="mt-6">
                <MpesaPaymentButton
                  amount={total}
                  state={payState}
                  onPay={payWithMpesa}
                />
              </div>

              {(payState === "failed" || payState === "timeout") && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {payState === "timeout" ? (
                    <>
                      ⏱ The M-Pesa request timed out. No money left your phone —
                      tap the button above to send a fresh prompt.
                    </>
                  ) : (
                    <>
                      ❌ The payment didn&apos;t go through. Check your balance
                      and try again — you have not been charged.
                    </>
                  )}
                </div>
              )}

              {isDemo && step === 2 && (
                <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                  {process.env.NODE_ENV !== "production" ? (
                    <>
                      <p className="font-bold">🧪 Demo mode active</p>
                      <p className="mt-1">
                        Supabase &amp; M-Pesa credentials are not configured, so no
                        real payment can run. Add env vars for live payments — or
                        preview the success experience:
                      </p>
                      <button
                        onClick={simulateDemoSuccess}
                        className="btn-primary mt-3 !py-2.5 text-sm"
                      >
                        Simulate Payment Success
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">📲 M-Pesa is being activated</p>
                      <p className="mt-1">
                        Live payments are switching on shortly. Want this order
                        right now? Send us your cart on WhatsApp and we&apos;ll
                        complete it manually with instant delivery.
                      </p>
                      <a
                        href="https://wa.me/254745198099"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary mt-3 !py-2.5 text-sm"
                      >
                        Order via WhatsApp
                      </a>
                    </>
                  )}
                </div>
              )}

              <p className="mt-4 text-center text-xs text-gray-500">
                You will receive an M-Pesa prompt on your phone — enter your PIN
                to complete.
              </p>

              <button
                onClick={() => setStep(1)}
                disabled={payState === "waiting" || payState === "loading"}
                className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:text-navy-700"
              >
                ← Back to details
              </button>
            </motion.div>
          )}

          {/* STEP 3 — success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-neon-gradient shadow-glow-neon"
              >
                <Check className="h-14 w-14 text-white" strokeWidth={2.5} />
              </motion.div>

              <h2 className="mt-6 text-3xl font-extrabold text-navy-800 md:text-4xl">
                Payment Successful! 🎉
              </h2>
              <p className="mt-2 badge-navy mx-auto inline-flex !px-5 !py-2 !text-sm">
                Order: <strong className="font-extrabold">{orderNumber}</strong>
              </p>
              <p className="mt-4 text-gray-500">
                Your download links are ready — grab them below.
              </p>

              <div className="mt-8 space-y-4 text-left">
                {successCards.map((item) => (
                  <DownloadCard
                    key={item.id}
                    title={item.title}
                    imageUrl={item.product?.thumbnail_url}
                    format={item.product?.file_format}
                    size={item.product?.file_size}
                    downloadsUsed={item.downloads_used}
                    maxDownloads={5}
                    onDownload={() => requestDownload(item)}
                  />
                ))}
              </div>

              {details?.email && (
                <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4 text-orange-500" />
                  We also sent links to <strong>{details.email}</strong>
                </p>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/marketplace" className="btn-primary">
                  <ShoppingBag className="h-4 w-4" /> Continue Shopping
                </Link>
                <Link href="/dashboard/downloads" className="btn-secondary">
                  View My Downloads
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Summary sidebar */}
        {step !== 3 && (
          <aside className="h-fit space-y-5 lg:sticky lg:top-24">
            <OrderSummaryCard
              items={items}
              subtotal={subtotal}
              discount={discount}
              couponCode={couponCode}
              total={total}
            />
            <div className="card-premium space-y-2.5 p-5 text-xs text-gray-500">
              <p className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-neon-500" /> SSL-encrypted
                checkout
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-500" /> 30-day
                money-back guarantee
              </p>
              <p className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-navy-500" /> Instant download
                after payment
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Waiting overlay */}
      <AnimatePresence>
        {payState === "waiting" && (
          <PaymentWaitingScreen
            phone={mpesaPhone}
            onTimeout={() => {
              stopPolling();
              setPayState("timeout");
            }}
            onCancel={() => {
              stopPolling();
              setPayState("idle");
              toast.info("Payment cancelled — your order is saved.");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
