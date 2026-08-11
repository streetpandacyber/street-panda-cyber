"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={item.question}
          className="card-premium overflow-hidden !rounded-2xl"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-navy-800">{item.question}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200",
                open === i && "rotate-180 text-orange-500"
              )}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-300",
              open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
