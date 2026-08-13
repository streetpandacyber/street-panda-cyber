"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/mock";
import { getInitials, cn } from "@/lib/utils";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, count]);

  const visible = [
    TESTIMONIALS[index],
    TESTIMONIALS[(index + 1) % count],
    TESTIMONIALS[(index + 2) % count],
  ];

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
          <span className="badge-orange">❤️ Testimonials</span>
          <h2 className="section-title mt-4">
            What Our <span className="text-gradient-orange">Customers</span> Say
          </h2>
          <p className="section-subtitle mt-4">
            Real reviews from real Kenyans — creators, students, teachers and
            entrepreneurs.
          </p>
        </motion.div>

        <div
          className="relative mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visible.map((t, i) => (
              <motion.div
                key={`${t.name}-${index}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className={cn(
                  "card-premium flex h-full flex-col p-7",
                  i === 1 && "md:-translate-y-2"
                )}
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-base leading-relaxed text-gray-600">
                  “{t.quote}”
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${t.color} text-sm font-bold text-white`}
                  >
                    {getInitials(t.name)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-navy-800">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.role} • {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 transition-all hover:border-orange-400 hover:text-orange-500"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    i === index
                      ? "w-8 bg-orange-500"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((i) => (i + 1) % count)}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 transition-all hover:border-orange-400 hover:text-orange-500"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
