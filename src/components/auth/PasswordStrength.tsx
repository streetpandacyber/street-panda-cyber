"use client";

import { useMemo } from "react";

export function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}

const LABELS = ["Too weak", "Weak", "Okay", "Good", "Strong"];
const COLORS = ["bg-red-500", "bg-red-400", "bg-yellow-400", "bg-neon-400", "bg-neon-500"];
const TEXT = ["text-red-500", "text-red-400", "text-yellow-500", "text-neon-600", "text-neon-600"];

export function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? COLORS[score] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-semibold ${TEXT[score]}`}>
        {LABELS[score]}
        {score < 2 && " — use 8+ characters with numbers & symbols"}
      </p>
    </div>
  );
}
