"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Download,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/data/mock";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";

type CouponState = "idle" | "loading" | "success" | "error";

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
  const [couponState, setCouponState] = useState<CouponState>("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const total = getTotal();

  const categoryName = (categoryId?: string, name?: string) =>
    name ?? MOCK_CATEGORIES.find((c) => c.id === categoryId)?.name;

  const askRemove = (id: string, title: string) => {
    if (confirmingId === id) {
      removeItem(id);
      setConfirmingId(null);
      toast.success(`Removed “${title}” from cart`);
    } else {
      setConfirmingId(id);
      setTimeout(() => setConfirmingId((c) => (c === id ? null : c)), 3000);
    }
  };

  const validateCoupon = async () => {
    if (!code.trim()) return;
    setCouponState("loading");
    setCouponMessage("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), cartTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error ?? "Invalid or expired coupon");
      }
      applyCoupon(data.code, data.discountAmount ?? data.discount);
      setCouponState("success");
      setCouponMessage(`${data.code} applied — you save ${formatPrice(data.discountAmount ?? data.discount)}`);
      setCode("");
    } catch (err) {
      setCouponState("error");
      setCouponMessage(
        err instanceof Error ? err.message : "Could not apply coupon"
      );
    }
  };

  const recommended = MOCK_PRODUCTS.filter(
    (p) => !items.some((i) => i.id === p.id)
  )
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 4);

  /* ── Empty state ─────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          {/* Shopping bag illustration */}
          <div className="relative">
            <span className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-orange-50">
              <ShoppingBag className="h-16 w-16 text-orange-400" strokeWidth={1.5} />
            </span>
            <span className="absolute -right-3 -top-3 animate-float text-3xl">✨</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-800 md:text-3xl">
            Your cart is empty
          </h1>
          <p className="max-w-md text-gray-500">
            Fill it with premium digital resources — every purchase downloads
            instantly after M-Pesa payment.
          </p>
          <Link href="/marketplace" className="btn-primary !px-8">
            Browse Marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Recommended even on empty cart */}
        <RecommendedSection products={recommended} />
      </div>
    );
  }

  /* ── Cart with items ─────────────────────────────── */
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
              className="card-premium flex gap-4 !rounded-2xl p-4"
            >
              <Link
                href={`/products/${item.product.slug}`}
                className="relative block h-[50px] w-[50px] shrink-0 overflow-hidden rounded-xl bg-gray-100"
              >
                {item.product.thumbnail_url ? (
                  <Image
                    src={item.product.thumbnail_url}
                    alt={item.product.title}
                    fill
                    sizes="50px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl">
                    📦
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="line-clamp-1 font-bold text-navy-800 hover:text-orange-600"
                  >
                    {item.product.title}
                  </Link>
                  {categoryName(item.product.category_id, item.product.category?.name) && (
                    <span className="badge-navy !px-2 !py-0.5">
                      {categoryName(item.product.category_id, item.product.category?.name)}
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-neon-600">
                  <Zap className="h-3.5 w-3.5" /> Instant Download
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-lg font-extrabold text-navy-800">
                    {formatPrice(item.product.sale_price ?? item.product.price)}
                    {item.product.sale_price !== undefined && (
                      <span className="ml-2 text-sm font-medium text-gray-400 line-through">
                        {formatPrice(item.product.price)}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => askRemove(item.id, item.product.title)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      confirmingId === item.id
                        ? "bg-red-500 text-white shadow-soft-sm"
                        : "text-gray-500 hover:bg-red-50 hover:text-red-500"
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {confirmingId === item.id ? "Confirm remove?" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          {/* Coupon */}
          <div className="card-premium p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy-800">
              <Tag className="h-4 w-4 text-orange-500" /> Coupon code
            </h3>
            {couponCode ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-neon-50 px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2 font-semibold text-neon-700">
                  ✅ {couponCode} — {formatPrice(discount)} off
                </span>
                <button
                  onClick={() => {
                    removeCoupon();
                    setCouponState("idle");
                  }}
                  className="rounded p-1 text-gray-400 hover:text-red-500"
                  aria-label="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mt-3 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCouponState("idle");
                    }}
                    placeholder="Try WELCOME20"
                    className="input-field !py-2.5 text-sm"
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={couponState === "loading" || !code.trim()}
                    className="btn-secondary shrink-0 !px-4 !py-2.5 text-sm"
                  >
                    {couponState === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {couponState === "success" && (
                  <p className="mt-2 text-xs font-semibold text-neon-600">
                    ✅ {couponMessage}
                  </p>
                )}
                {couponState === "error" && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    ❌ {couponMessage}
                  </p>
                )}
              </>
            )}
          </div>

          <OrderSummaryCard
            items={items}
            subtotal={subtotal}
            discount={discount}
            couponCode={couponCode}
            total={total}
          />

          {/* Trust badges */}
          <div className="card-premium grid grid-cols-3 gap-2 p-4 text-center">
            {[
              { icon: Lock, label: "Secure Payment" },
              { icon: Download, label: "Instant Access" },
              { icon: ShieldCheck, label: "30-Day Guarantee" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-50">
                  <Icon className="h-4 w-4 text-neon-600" />
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="btn-primary w-full !py-4"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>

      <RecommendedSection products={recommended} />
    </div>
  );
}

function RecommendedSection({ products }: { products: typeof MOCK_PRODUCTS }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-navy-800">You might also like</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
