"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Download",
    description:
      "Files unlock automatically the moment your M-Pesa payment confirms.",
    bg: "bg-orange-50",
  },
  {
    icon: "🔒",
    title: "Secure Payments (M-Pesa)",
    description:
      "Powered by Safaricom Daraja — your payment never touches our servers.",
    bg: "bg-neon-50",
  },
  {
    icon: "♾️",
    title: "Lifetime Access",
    description:
      "Buy once, download again anytime from your personal dashboard.",
    bg: "bg-navy-50",
  },
  {
    icon: "🔄",
    title: "Regular Updates",
    description:
      "Products evolve with new prompts, templates and content — free of charge.",
    bg: "bg-violet-50",
  },
  {
    icon: "⭐",
    title: "High Quality Content",
    description:
      "Every product is created, tested and reviewed before it hits the store.",
    bg: "bg-yellow-50",
  },
  {
    icon: "🌱",
    title: "Made for Beginners",
    description:
      "Clear guides and quick-start steps mean zero learning curve.",
    bg: "bg-pink-50",
  },
  {
    icon: "💼",
    title: "Made for Professionals",
    description:
      "Agency-grade templates and systems trusted by working pros.",
    bg: "bg-blue-50",
  },
  {
    icon: "💬",
    title: "Excellent Support",
    description:
      "Real humans on WhatsApp and email, answering within hours.",
    bg: "bg-teal-50",
  },
];

export function WhyChooseUs() {
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
          <span className="badge-neon">Why JM Majiwa</span>
          <h2 className="section-title mt-4">
            Built Different, <span className="text-gradient-orange">Built for Kenya</span>
          </h2>
          <p className="section-subtitle mt-4">
            Eight reasons over 10,000 customers trust us with their digital
            growth.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
              className="card-premium p-6"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg} text-2xl`}
              >
                {f.icon}
              </span>
              <h3 className="mt-4 text-base font-bold text-navy-800">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
