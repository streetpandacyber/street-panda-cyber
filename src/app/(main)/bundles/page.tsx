import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Gift, ShieldCheck, Zap } from "lucide-react";
import { getBundles } from "@/lib/data/service";
import { calculateDiscount, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mega Bundles — Save Up To 67%",
  description:
    "Bundle deals on premium digital products: AI prompt packs, Canva templates, study materials and business tools. Pay with M-Pesa, download instantly.",
};

export const dynamic = "force-dynamic";

export default async function BundlesPage() {
  const bundles = await getBundles();

  return (
    <div>
      {/* Header */}
      <section className="hero-gradient relative overflow-hidden py-20 text-center text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-500/25 blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-neon-400/20 blur-[100px]" />
        <div className="container-custom relative">
          <span className="badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold animate-fade-up opacity-0">
            🎁 Bundle Deals
          </span>
          <h1 className="mt-5 animate-fade-up animation-delay-100 text-4xl font-extrabold opacity-0 md:text-5xl">
            Save Up To <span className="text-gradient-orange">67%</span> With Bundles
          </h1>
          <p className="mx-auto mt-4 max-w-2xl animate-fade-up animation-delay-200 text-lg text-white/70 opacity-0">
            Our best-selling products grouped together at one unbeatable price.
            One M-Pesa payment, instant downloads, lifetime access.
          </p>
        </div>
      </section>

      {/* Bundles grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom grid gap-8 lg:grid-cols-3">
          {bundles.map((bundle, i) => {
            const savings = bundle.original_price - bundle.bundle_price;
            const pct = calculateDiscount(bundle.original_price, bundle.bundle_price);
            return (
              <div
                key={bundle.id}
                className={`card-premium relative flex h-full animate-fade-up flex-col overflow-hidden opacity-0 ${
                  i === 1 ? "ring-2 ring-orange-500" : ""
                }`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {i === 1 && (
                  <span className="absolute right-4 top-4 z-10 badge bg-orange-500 text-white shadow-glow-orange">
                    ⭐ Most Popular
                  </span>
                )}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                  {bundle.thumbnail_url && (
                    <Image
                      src={bundle.thumbnail_url}
                      alt={bundle.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute left-4 top-4 badge bg-neon-400 font-extrabold text-navy-900">
                    Save {pct}%
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-bold text-navy-800">{bundle.title}</h2>
                  {bundle.description && (
                    <p className="mt-2 text-sm text-gray-500">{bundle.description}</p>
                  )}
                  <ul className="mt-4 space-y-2">
                    {(bundle.products ?? []).map((p) => (
                      <li key={p.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 shrink-0 text-neon-500" />
                        <span className="truncate">{p.title}</span>
                        <span className="ml-auto shrink-0 text-xs text-gray-400">
                          {formatPrice(p.sale_price ?? p.price, p.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-navy-800">
                        {formatPrice(bundle.bundle_price, bundle.currency)}
                      </span>
                      <span className="text-base text-gray-400 line-through">
                        {formatPrice(bundle.original_price, bundle.currency)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-neon-600">
                      You save {formatPrice(savings, bundle.currency)} ({pct}% off)
                    </p>
                  </div>
                  <Link href="/marketplace" className="btn-primary mt-5 w-full">
                    <Gift className="h-4 w-4" /> Get This Bundle
                  </Link>
                  <p className="mt-3 text-center text-xs text-gray-400">
                    Add the products to your cart — bundle pricing applied
                    automatically at checkout.
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="container-custom mt-12 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-navy-700">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-neon-500" /> Instant download
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-orange-500" /> 30-day money-back
            guarantee
          </span>
          <span className="text-gray-300">•</span>
          <span>🔒 Secure M-Pesa checkout</span>
        </div>

        <div className="container-custom mt-10 text-center">
          <Link href="/marketplace" className="btn-secondary">
            Or Browse Individual Products
          </Link>
        </div>
      </section>
    </div>
  );
}
