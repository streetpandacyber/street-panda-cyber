"use client";

import { motion } from "framer-motion";

const BADGES = [
  { icon: "✅", label: "30-Day Money Back Guarantee" },
  { icon: "🔒", label: "Secure M-Pesa Payment" },
  { icon: "⚡", label: "Instant Digital Download" },
  { icon: "✓", label: "Verified Creator Content" },
  { icon: "👥", label: "10,000+ Happy Customers" },
];

export function TrustSection() {
  return (
    <section className="bg-gray-50 py-14">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {BADGES.map((badge, i) => (
            <motion.span
              key={badge.label}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-700 shadow-soft-sm"
            >
              <span className="text-base">{badge.icon}</span>
              {badge.label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
