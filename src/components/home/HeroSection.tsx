"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Download, Gift, Lock, Sparkles } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const STATS = [
  { value: "500+", label: "Products" },
  { value: "10,000+", label: "Customers" },
  { value: "50,000+", label: "Downloads" },
  { value: "4.9/5", label: "Rating" },
];

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden text-white">
      {/* Animated grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glowing blur circles */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-orange-500/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-neon-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-navy-400/30 blur-[100px]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-custom relative grid gap-14 py-20 md:py-28 lg:grid-cols-2 lg:items-center"
      >
        {/* Left column */}
        <div>
          <motion.div variants={item}>
            <span className="badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-400" />
              </span>
              Kenya&apos;s #1 Digital Products Marketplace
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Discover Premium{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
              AI Resources
            </span>{" "}
            That Save You{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">Hours Every Week</span>
              <svg
                className="absolute -bottom-1.5 left-0 h-3 w-full text-orange-500"
                viewBox="0 0 200 9"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7c40-5 120-5 196-2"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
          >
            Prompt packs, Canva templates, eBooks and study materials — pay
            with M-Pesa and download instantly. Built for Kenyan creators,
            students and businesses.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/marketplace"
              className="btn-primary !px-8 !py-4 text-base"
            >
              Browse Marketplace
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/bundles"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10"
            >
              <Gift className="h-5 w-5" />
              Explore Bundles
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.dl
            variants={item}
            className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-extrabold text-white sm:text-3xl">
                  {stat.value}
                </dd>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right column — floating product mockup cards */}
        <motion.div
          variants={item}
          className="relative mx-auto hidden h-[480px] w-full max-w-md lg:block"
        >
          {/* Card 1 */}
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 top-6 w-64 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 shadow-soft-xl"
          >
            <Sparkles className="h-8 w-8 text-white" />
            <p className="mt-3 font-bold text-white">ChatGPT Prompt Pack</p>
            <p className="mt-1 text-sm text-white/80">500 prompts • KES 1,200</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-white">
              ⭐⭐⭐⭐⭐ <span className="text-white/80">4.9</span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
            className="absolute right-0 top-32 w-64 rounded-3xl bg-gradient-to-br from-neon-400 to-neon-500 p-5 shadow-soft-xl"
          >
            <span className="text-3xl">🎨</span>
            <p className="mt-3 font-bold text-navy-900">Canva Social Pack</p>
            <p className="mt-1 text-sm text-navy-900/70">
              300+ templates • KES 890
            </p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/40 px-2.5 py-1 text-xs font-bold text-navy-900">
              ⚡ Instant Download
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.6,
            }}
            className="absolute bottom-4 left-10 w-64 rounded-3xl border border-white/15 bg-navy-800/80 p-5 shadow-soft-xl backdrop-blur"
          >
            <span className="text-3xl">🎓</span>
            <p className="mt-3 font-bold text-white">Kenya KCSE Pack</p>
            <p className="mt-1 text-sm text-white/70">
              Full revision set • KES 1,500
            </p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-neon-400/20 px-2.5 py-1 text-xs font-bold text-neon-300">
              ✅ 2,600+ students
            </div>
          </motion.div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 top-56 flex items-center gap-2 rounded-full bg-neon-gradient px-4 py-2 text-sm font-bold text-navy-900 shadow-glow-neon"
          >
            <Lock className="h-4 w-4" /> Secure Payment
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute -right-2 bottom-20 flex items-center gap-2 rounded-full bg-orange-gradient px-4 py-2 text-sm font-bold text-white shadow-glow-orange"
          >
            <Download className="h-4 w-4" /> Instant Download
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Wave divider */}
      <svg
        className="relative block w-full text-white"
        viewBox="0 0 1440 90"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,48 C240,96 480,96 720,64 C960,32 1200,16 1440,40 L1440,90 L0,90 Z" />
      </svg>
    </section>
  );
}
