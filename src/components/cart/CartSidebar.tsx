"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function CartSidebar() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    getSubtotal,
    getTotal,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();

  const validateCoupon = async () => {
    if (!code.trim()) return;
    setValidating(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error ?? "Invalid or expired coupon");
      }
      applyCoupon(data.code, data.discount);
      toast.success(`Coupon applied — you save ${formatPrice(data.discount)}!`);
      setCode("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not apply coupon"
      );
    } finally {
      setValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-soft-xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                Your Cart
                {items.length > 0 && (
                  <span className="badge-orange">{items.length}</span>
                )}
              </h2>
              <button onClick={closeCart} className="btn-ghost !p-2" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Empty state */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-5xl">
                  🛒
                </div>
                <h3 className="text-lg font-bold text-navy-800">
                  Your cart is empty
                </h3>
                <p className="max-w-xs text-sm text-gray-500">
                  Browse the marketplace and grab premium digital resources —
                  downloads are instant!
                </p>
                <Link href="/marketplace" className="btn-primary" onClick={closeCart}>
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-soft-sm"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {item.product.thumbnail_url ? (
                          <Image
                            src={item.product.thumbnail_url}
                            alt={item.product.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-2xl">
                            📦
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-800">
                          {item.product.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neon-600">
                          ⚡ Instant download
                        </p>
                        <p className="mt-1 text-sm font-bold text-orange-600">
                          {formatPrice(
                            item.product.sale_price ?? item.product.price
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="self-start rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove ${item.product.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-5">
                  {/* Coupon */}
                  {couponCode ? (
                    <div className="mb-4 flex items-center justify-between rounded-xl bg-neon-50 px-4 py-2.5 text-sm">
                      <span className="flex items-center gap-2 font-semibold text-neon-700">
                        <Tag className="h-4 w-4" /> {couponCode} applied
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-medium text-gray-500 underline hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="input-field !py-2.5 text-sm"
                      />
                      <button
                        onClick={validateCoupon}
                        disabled={validating}
                        className="btn-secondary shrink-0 !px-4 !py-2.5 text-sm"
                      >
                        {validating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-neon-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-navy-800">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeCart();
                      router.push("/checkout");
                    }}
                    className="btn-primary mt-4 w-full"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={closeCart}
                    className="mt-2 w-full text-center text-sm font-medium text-gray-500 transition-colors hover:text-navy-700"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
