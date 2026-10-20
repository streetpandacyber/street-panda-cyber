import type { ComponentType } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import {
  BookIcon,
  BriefcaseIcon,
  Kicker,
  LayoutIcon,
  Rise,
  SparklesIcon,
  Words,
} from "../components/ui";
import { COLORS, SCENE_PADDING } from "../theme";

/**
 * Scene 2 — what's on sale (3.0s–7.5s).
 * Four category cards slide in one after another.
 */

type Product = {
  title: string;
  subtitle: string;
  color: string;
  Icon: ComponentType<{ size: number; color: string }>;
};

const PRODUCTS: Product[] = [
  {
    title: "AI Prompt Packs",
    subtitle: "ChatGPT & AI tools, mastered",
    color: COLORS.orange400,
    Icon: SparklesIcon,
  },
  {
    title: "Canva Templates",
    subtitle: "Posts, posters & brands in minutes",
    color: COLORS.indigo300,
    Icon: LayoutIcon,
  },
  {
    title: "eBooks & Study Materials",
    subtitle: "Learn anywhere, anytime",
    color: COLORS.neon400,
    Icon: BookIcon,
  },
  {
    title: "Business Tools",
    subtitle: "Plans, sheets & starter kits",
    color: COLORS.orange300,
    Icon: BriefcaseIcon,
  },
];

/** Slides in from alternating sides, like cards being dealt. */
const ProductCard: React.FC<{ product: Product; index: number }> = ({
  product,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { Icon } = product;

  const progress = spring({
    frame: frame - (24 + index * 12),
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.75 },
  });
  const fromX = index % 2 === 0 ? 150 : -150;

  return (
    <div
      style={{
        opacity: interpolate(progress, [0, 0.5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: `translateX(${(1 - progress) * fromX}px) scale(${
          0.96 + progress * 0.04
        })`,
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "38px 40px",
        borderRadius: 38,
        backgroundColor: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(255,255,255,0.13)",
        boxShadow: "0 24px 50px rgba(2,6,24,0.35)",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 106,
          height: 106,
          borderRadius: 30,
          // Colour at ~16% alpha ("29" hex) as the icon's backdrop.
          backgroundColor: `${product.color}29`,
          border: `1.5px solid ${product.color}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={54} color={product.color} />
      </div>
      <div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: -0.5,
            lineHeight: 1.12,
          }}
        >
          {product.title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 33,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {product.subtitle}
        </div>
      </div>
    </div>
  );
};

export const Products: React.FC = () => {
  const frame = useCurrentFrame();
  const dotPulse = 1 + Math.sin(frame / 5) * 0.22;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={SCENE_PADDING}>
        <Rise delay={4} y={36}>
          <Kicker text="EVERYTHING YOU NEED" />
        </Rise>

        <div style={{ marginTop: 34 }}>
          <Words
            parts={[{ text: "Digital" }, { text: "products" }]}
            delay={10}
            stagger={5}
            fontSize={82}
          />
          <Words
            parts={[
              { text: "that" },
              { text: "work", accent: "orange" },
              { text: "for" },
              { text: "you." },
            ]}
            delay={20}
            stagger={4}
            fontSize={82}
          />
        </div>

        <div
          style={{
            marginTop: 62,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.title} product={product} index={i} />
          ))}
        </div>

        <Rise delay={80} style={{ marginTop: "auto", alignSelf: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 34px",
              borderRadius: 999,
              backgroundColor: "rgba(57,211,83,0.12)",
              border: "1.5px solid rgba(57,211,83,0.35)",
            }}
          >
            <div
              style={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                backgroundColor: COLORS.neon400,
                boxShadow: `0 0 16px ${COLORS.neon400}`,
                transform: `scale(${dotPulse})`,
              }}
            />
            <div style={{ fontSize: 34, fontWeight: 700 }}>
              New products drop every week
            </div>
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
