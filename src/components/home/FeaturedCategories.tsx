"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import type { Category } from "@/types";

interface FeaturedCategoriesProps {
  categories?: (Category & { product_count?: number })[];
}

const CATEGORIES = [
  {
    name: "AI Prompt Packs",
    icon: "🤖",
    gradient: "from-violet-500 to-purple-600",
    count: "120+ products",
    subs: ["ChatGPT", "Claude"],
    slug: "ai-prompt-packs",
  },
  {
    name: "Canva Templates",
    icon: "🎨",
    gradient: "from-blue-500 to-indigo-600",
    count: "95+ products",
    subs: ["Social", "Decks"],
    slug: "canva-templates",
  },
  {
    name: "eBooks",
    icon: "📚",
    gradient: "from-orange-500 to-orange-600",
    count: "60+ products",
    subs: ["Business", "AI"],
    slug: "ebooks",
  },
  {
    name: "Social Media Packs",
    icon: "📱",
    gradient: "from-pink-500 to-rose-600",
    count: "75+ products",
    subs: ["Reels", "Stories"],
    slug: "social-media-packs",
  },
  {
    name: "Digital Learning",
    icon: "🎓",
    gradient: "from-neon-500 to-neon-600",
    count: "85+ products",
    subs: ["KCSE", "KCPE"],
    slug: "digital-learning",
  },
  {
    name: "Productivity Tools",
    icon: "⚡",
    gradient: "from-yellow-400 to-amber-500",
    count: "40+ products",
    subs: ["Notion", "Planners"],
    slug: "productivity-tools",
  },
  {
    name: "Business Templates",
    icon: "💼",
    gradient: "from-navy-600 to-navy-800",
    count: "70+ products",
    subs: ["Plans", "Invoices"],
    slug: "business-templates",
  },
  {
    name: "Mega Bundles",
    icon: "🎁",
    gradient: "from-orange-500 to-red-500",
    count: "15+ bundles",
    subs: ["Save 50%+", "Best value"],
    slug: "mega-bundles",
  },
];

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const cats = useMemo(() => {
    if (!categories?.length) return CATEGORIES;
    return CATEGORIES.map((c) => {
      const live = categories.find((lc) => lc.slug === c.slug);
      if (!live) return c;
      const n = live.product_count ?? 0;
      return { ...c, count: `${n} product${n === 1 ? "" : "s"}` };
    });
  }, [categories]);

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
          <span className="badge-orange">Browse Categories</span>
          <h2 className="section-title mt-4">
            Everything You Need to <span className="text-gradient-orange">Grow</span>
          </h2>
          <p className="section-subtitle mt-4">
            Eight carefully curated collections of premium digital resources,
            built for the Kenyan market.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.07 }}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {cats.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                href={
                  cat.slug === "mega-bundles" ? "/bundles" : `/marketplace?category=${cat.slug}`
                }
                className="card-premium group flex h-full flex-col p-6"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-2xl shadow-soft-md transition-transform duration-300 group-hover:scale-110`}
                >
                  <span>{cat.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy-800">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{cat.count}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cat.subs.map((sub) => (
                    <span
                      key={sub}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
