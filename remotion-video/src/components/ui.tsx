import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_SANS } from "../theme";

/**
 * Shared building blocks: animated-text primitives, motion wrappers,
 * the logo mark and a small hand-drawn SVG icon set (so renders never
 * depend on an emoji font being installed).
 */

/* ------------------------------------------------------------------ */
/* Motion wrappers                                                     */
/* ------------------------------------------------------------------ */

/** Springs its children up into place with a fade. */
export const Rise: React.FC<{
  delay?: number;
  /** How far (px) the element travels while entering. */
  y?: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ delay = 0, y = 56, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 17, stiffness: 130, mass: 0.7 },
  });

  return (
    <div
      style={{
        opacity: interpolate(progress, [0, 0.55], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${(1 - progress) * y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Elastic scale-in, for logos, badges and buttons. */
export const Pop: React.FC<{
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ delay = 0, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.6 },
  });

  return (
    <div
      style={{
        opacity: Math.min(1, progress * 1.6),
        transform: `scale(${progress})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Animated text                                                       */
/* ------------------------------------------------------------------ */

export type WordPart = {
  text: string;
  accent?: "orange" | "neon";
};

const gradientText = (from: string, to: string): CSSProperties => ({
  backgroundImage: `linear-gradient(92deg, ${from} 0%, ${to} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

const accentStyle = (accent?: WordPart["accent"]): CSSProperties => {
  if (accent === "orange") {
    return gradientText(COLORS.orange400, COLORS.orange600);
  }
  if (accent === "neon") {
    return gradientText(COLORS.neon300, COLORS.neon500);
  }
  return {};
};

/**
 * Word-by-word headline reveal: every word rises out of an overflow
 * mask with a spring, staggered left to right.
 */
export const Words: React.FC<{
  parts: WordPart[];
  delay?: number;
  stagger?: number;
  fontSize: number;
  fontWeight?: number;
  lineHeight?: number;
  align?: "left" | "center";
  letterSpacing?: number;
  style?: CSSProperties;
}> = ({
  parts,
  delay = 0,
  stagger = 5,
  fontSize,
  fontWeight = 900,
  lineHeight = 1.04,
  align = "left",
  letterSpacing = -1,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        color: COLORS.white,
        textAlign: align,
        ...style,
      }}
    >
      {parts.map((part, i) => {
        const progress = spring({
          frame: frame - (delay + i * stagger),
          fps,
          config: { damping: 16, stiffness: 150, mass: 0.6 },
        });
        return (
          <span
            key={`${part.text}-${i}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "bottom",
              // Room for descenders ("g", "y", …) inside the mask.
              paddingBottom: "0.14em",
              marginBottom: "-0.14em",
              marginRight: i === parts.length - 1 ? 0 : "0.24em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                transform: `translateY(${(1 - progress) * 112}%)`,
                ...accentStyle(part.accent),
              }}
            >
              {part.text}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Small section label, e.g. — EVERYTHING YOU NEED */
export const Kicker: React.FC<{ text: string; color?: string }> = ({
  text,
  color = COLORS.orange400,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
    <div
      style={{
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: color,
      }}
    />
    <div
      style={{
        fontSize: 31,
        fontWeight: 800,
        letterSpacing: 5,
        color,
      }}
    >
      {text}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */

/** The JM Majiwa bolt mark: orange rounded square with a white bolt. */
export const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(140deg, ${COLORS.orange400} 0%, ${COLORS.orange500} 55%, ${COLORS.orange600} 100%)`,
      boxShadow: `0 ${size * 0.12}px ${size * 0.45}px rgba(249, 115, 22, 0.45)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <BoltIcon size={size * 0.62} color={COLORS.white} filled />
  </div>
);

/* ------------------------------------------------------------------ */
/* Icons (inline SVG — bulletproof across render machines)             */
/* ------------------------------------------------------------------ */

type IconProps = {
  size: number;
  color: string;
  strokeWidth?: number;
};

const StrokeIcon: React.FC<IconProps & { children: ReactNode }> = ({
  size,
  color,
  strokeWidth = 2.1,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const BoltIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size,
  color,
  filled = false,
}) =>
  filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
    </svg>
  ) : (
    <StrokeIcon size={size} color={color}>
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
    </StrokeIcon>
  );

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
  </StrokeIcon>
);

export const LayoutIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M3 9.5h18M9.5 21V9.5" />
  </StrokeIcon>
);

export const BookIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props}>
    <path d="M2.5 4.5A2.5 2.5 0 0 1 5 2h14v20H5a2.5 2.5 0 0 1 0-5h14" />
    <path d="M2.5 4.5V17" />
  </StrokeIcon>
);

export const BriefcaseIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props}>
    <rect x="2.5" y="7" width="19" height="13.5" rx="2.5" />
    <path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M2.5 13h19" />
  </StrokeIcon>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props} strokeWidth={props.strokeWidth ?? 3}>
    <path d="M20 6.5 9.5 17 4 11.5" />
  </StrokeIcon>
);

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props} strokeWidth={props.strokeWidth ?? 2.6}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </StrokeIcon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props} strokeWidth={props.strokeWidth ?? 2.6}>
    <path d="m6 9 6 6 6-6" />
  </StrokeIcon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props}>
    <path d="M12 3v11M7 10l5 5 5-5M4 21h16" />
  </StrokeIcon>
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props}>
    <path d="M12 22s8-3.4 8-10V5l-8-3-8 3v7c0 6.6 8 10 8 10z" />
    <path d="m9 11.5 2 2 4-4" />
  </StrokeIcon>
);

export const MessageIcon: React.FC<IconProps> = (props) => (
  <StrokeIcon {...props}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </StrokeIcon>
);
