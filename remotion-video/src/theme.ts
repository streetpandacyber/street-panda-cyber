import type { CSSProperties } from "react";

/**
 * JM Majiwa — 15s vertical promo (TikTok / Reels / Shorts / WhatsApp Status)
 *
 * Everything you might want to tweak lives in this file:
 * copy (BRAND), colours (COLORS — taken from the website's
 * tailwind.config.ts) and timing (SCENE_FRAMES).
 * The four scenes in src/scenes/ only handle layout and motion.
 */

/* ------------------------------------------------------------------ */
/* Video format: 1080x1920, 30fps, 15 seconds = 450 frames             */
/* ------------------------------------------------------------------ */

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Length of every scene transition (0.5s). */
export const TRANSITION_FRAMES = 15;

/**
 * Duration of each scene in frames (30fps).
 * TransitionSeries overlaps scenes by TRANSITION_FRAMES, so the total is
 * 105 + 135 + 120 + 135 − (3 × 15) = 450 frames = exactly 15.0s.
 */
export const SCENE_FRAMES = {
  hook: 105, //  0.0s – 3.5s  "Learn Faster. Create Smarter. Grow with AI."
  products: 135, // 3.0s – 7.5s  product category cards
  mpesa: 120, //   7.0s – 11.0s M-Pesa STK Push → instant download
  cta: 135, //     10.5s – 15.0s logo, call-to-action, contacts
} as const;

export const TOTAL_FRAMES =
  SCENE_FRAMES.hook +
  SCENE_FRAMES.products +
  SCENE_FRAMES.mpesa +
  SCENE_FRAMES.cta -
  TRANSITION_FRAMES * 3;

/* ------------------------------------------------------------------ */
/* Brand + copy                                                        */
/* ------------------------------------------------------------------ */

export const BRAND = {
  name: "JM Majiwa",
  badge: "KENYA'S #1 DIGITAL MARKETPLACE",
  url: "jmmajiwa.com",
  WhatsApp: "0745 198 099",
} as const;

/* ------------------------------------------------------------------ */
/* Colours — the website's navy / orange / neon palette                */
/* ------------------------------------------------------------------ */

export const COLORS = {
  navy950: "#020618",
  navy900: "#050b2e",
  navy800: "#0a1240",
  navy700: "#0f1a5c",
  navy600: "#1a2980",
  indigo400: "#818cf8",
  indigo300: "#a5b4fc",
  orange600: "#ea580c",
  orange500: "#f97316",
  orange400: "#fb923c",
  orange300: "#fdba74",
  neon500: "#22c55e",
  neon400: "#39d353",
  neon300: "#86efac",
  white: "#ffffff",
} as const;

/* ------------------------------------------------------------------ */
/* Type                                                                */
/* ------------------------------------------------------------------ */

/**
 * No web-font downloads: renders must work fully offline.
 * On machines with Inter installed it is used (matching the website);
 * everywhere else the system sans takes over.
 */
export const FONT_SANS =
  'Inter, "Segoe UI", system-ui, -apple-system, Arial, sans-serif';
export const FONT_MONO =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

/**
 * Page padding for every scene. The generous top/bottom insets keep the
 * important content clear of TikTok/Reels UI overlays (captions, buttons).
 */
export const SCENE_PADDING: CSSProperties = {
  padding: "150px 72px 230px",
  display: "flex",
  flexDirection: "column",
  fontFamily: FONT_SANS,
  color: COLORS.white,
};
