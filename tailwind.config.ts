import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d5fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#1a2980",
          700: "#0f1a5c",
          800: "#0a1240",
          900: "#050b2e",
          950: "#020618",
        },
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea6c10",
          700: "#c2570a",
          800: "#9a4409",
          900: "#7c3707",
        },
        neon: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#39d353",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "soft-sm": "0 2px 8px 0 rgba(26,41,128,0.06)",
        "soft-md": "0 4px 24px 0 rgba(26,41,128,0.08)",
        "soft-lg": "0 8px 40px 0 rgba(26,41,128,0.12)",
        "soft-xl": "0 16px 64px 0 rgba(26,41,128,0.16)",
        "glow-orange": "0 0 20px rgba(249,115,22,0.4)",
        "glow-neon": "0 0 20px rgba(57,211,83,0.4)",
        "card-hover": "0 20px 60px -10px rgba(26,41,128,0.2)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg,#050b2e 0%,#1a2980 50%,#0f1a5c 100%)",
        "orange-gradient":
          "linear-gradient(135deg,#f97316 0%,#ea6c10 100%)",
        "neon-gradient":
          "linear-gradient(135deg,#39d353 0%,#22c55e 100%)",
        "card-gradient":
          "linear-gradient(145deg,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 20px rgba(249,115,22,0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(249,115,22,0.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};

export default config;
