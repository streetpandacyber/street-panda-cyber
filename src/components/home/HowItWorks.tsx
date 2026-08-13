"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  Download,
  GraduationCap,
  Search,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    step: "1",
    title: "Browse Products",
    description:
      "Explore hundreds of premium digital products across 8 categories.",
    icon: Search,
    color: "bg-navy-600",
  },
  {
    step: "2",
    title: "Pay Securely",
    description:
      "Pay instantly with M-Pesa — the STK prompt pops right on your phone.",
    icon: ShieldCheck,
    color: "bg-orange-500",
    extra: (
      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-neon-50 px-2.5 py-1 text-[10px] font-bold text-neon-700">
        <span className="h-1.5 w-1.5 rounded-full bg-neon-500" /> M-PESA
      </span>
    ),
  },
  {
    step: "3",
    title: "Download Instantly",
    description:
      "Your files unlock the second payment confirms — plus a copy by email.",
    icon: Download,
    color: "bg-neon-500",
  },
  {
    step: "4",
    title: "Start Learning",
    description:
      "Use your resources immediately and enjoy lifetime access with updates.",
    icon: GraduationCap,
    color: "bg-purple-500",
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="badge-navy">How It Works</span>
          <h2 className="section-title mt-4">
            From Cart to Download in <span className="text-gradient-orange">60 Seconds</span>
          </h2>
          <p className="section-subtitle mt-4">
            No waiting, no manual delivery. Our fully automated system gets your
            files to you instantly.
          </p>
        </motion.div>

        <div className="relative mt-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="relative text-center"
                >
                  {/* Connector arrow (desktop) */}
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="absolute -right-7 top-10 hidden h-6 w-6 text-gray-300 lg:block" />
                  )}
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                    <span
                      className={`flex h-20 w-20 items-center justify-center rounded-3xl ${s.color} shadow-soft-lg`}
                    >
                      <Icon className="h-9 w-9 text-white" />
                    </span>
                    <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-xs font-extrabold text-white ring-4 ring-gray-50">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-navy-800">
                    {s.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
                    {s.description}
                  </p>
                  {s.extra}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
