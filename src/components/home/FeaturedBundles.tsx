"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Gift } from "lucide-react";
import { MOCK_BUNDLES } from "@/lib/data/mock";
import { calculateDiscount, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function FeaturedBundles() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="badge-orange">🎁 Bundles</span>
          <h2 className="section-title mt-4">
            Save Big with <span className="text-gradient-orange">Value Bundles</span>
          </h2>
          <p className="section-subtitle mt-4">
            Get multiple best-selling products together at one unbeatable price.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {MOCK_BUNDLES.map((bundle, i) => {
            const savings = bundle.original_price - bundle.bundle_price;
            const pct = calculateDiscount(bundle.original_price, bundle.bundle_price);
            const popular = i === 1;
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={cn(
                  "card-premium relative flex h-full flex-col overflow-hidden",
                  popular && "ring-2 ring-orange-500"
                )}
              >
                {popular && (
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
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute left-4 top-4 badge bg-neon-400 text-navy-900 font-extrabold">
                    Save {pct}%
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-navy-800">{bundle.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {(bundle.products ?? []).slice(0, 5).map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <Check className="h-4 w-4 shrink-0 text-neon-500" />
                        <span className="truncate">{p.title}</span>
                      </li>
                    ))}
                    {(bundle.products?.length ?? 0) > 5 && (
                      <li className="pl-6 text-sm font-semibold text-orange-600">
                        +{(bundle.products?.length ?? 0) - 5} more products
                      </li>
                    )}
                  </ul>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-navy-800">
                        {formatPrice(bundle.bundle_price, bundle.currency)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(bundle.original_price, bundle.currency)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-neon-600">
                      You save {formatPrice(savings, bundle.currency)}
                    </p>
                  </div>

                  <Link href="/bundles" className="btn-primary mt-5 w-full">
                    <Gift className="h-4 w-4" />
                    Get This Bundle
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/bundles" className="btn-secondary">
            View All Bundles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
