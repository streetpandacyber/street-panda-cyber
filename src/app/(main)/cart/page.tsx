"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
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
      toast.error(err instanceof Error ? err.message : "Could not apply coupon");
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom flex flex-col items-center gap-5 py-32 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-orange-50 text-6xl">
          🛒
        </div>
        <h1 className="text-2xl font-extrabold text-navy-800">
          Your cart is empty
        </h1>
        <p className="max-w-md text-gray-500">
          Explore the marketplace and find premium digital resources — every
          purchase downloads instantly.
        </p>
        <Link href="/marketplace" className="btn-primary">
          <ShoppingBag className="h-4 w-4" /> Browse the Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-extrabold text-navy-800 md:text-4xl">
        Your Cart
      </h1>
      <p className="mt-1 text-gray-500">
        {items.length} item{items.length === 1 ? "" : "s"} ready for checkout
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card-premium flex gap-4 !rounded-2xl p-4 sm:gap-5 sm:p-5"
            >
              <Link
                href={`/products/${item.product.slug}`}
                className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28"
              >
                {item.product.thumbnail_url ? (
                  <Image
                    src={item.product.thumbnail_url}
                    alt={item.product.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl">
                    📦
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="line-clamp-1 font-bold text-navy-800 hover:text-orange-600">
                    {item.product.title}
                  </h3>
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-neon-600">
                  <Zap className="h-3.5 w-3.5" /> Instant digital download
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Digital product • quantity 1 • lifetime access
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-extrabold text-navy-800">
                    {formatPrice(item.product.sale_price ?? item.product.price)}
                    {item.product.sale_price !== undefined && (
                      <span className="ml-2 text-sm font-medium text-gray-400 line-through">
                        {formatPrice(item.product.price)}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card-premium p-6">
            <h2 className="text-lg font-bold text-navy-800">Order Summary</h2>

            {couponCode ? (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-neon-50 px-4 py-2.5 text-sm">
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
              <div className="mt-4 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code (try WELCOME20)"
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

            <div className="mt-5 space-y-2 text-sm">
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
              <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-extrabold text-navy-800">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="btn-primary mt-6 w-full !py-4"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-5 space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-neon-500" /> Secure M-Pesa
                payment via Safaricom Daraja
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
          </div>
        </aside>
      </div>
    </div>
  );
}
