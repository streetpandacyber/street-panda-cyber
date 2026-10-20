import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import {
  ChevronDownIcon,
  LogoMark,
  Pop,
  Rise,
  Words,
} from "../components/ui";
import { BRAND, COLORS, SCENE_PADDING } from "../theme";

/**
 * Scene 1 — the hook (0.0s–3.5s).
 * Brand row, marketplace badge, then the tagline lands line by line:
 * "Learn / Faster. / Create / Smarter. / Grow with AI."
 */

const HEADLINE_SIZE = 148;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const chevronBounce = Math.sin(frame / 6) * 9;
  const dotPulse = 1 + Math.sin(frame / 5) * 0.22;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={SCENE_PADDING}>
        {/* Brand row */}
        <Rise delay={2} y={36}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <LogoMark size={80} />
            <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -0.5 }}>
              {BRAND.name}
            </div>
          </div>
        </Rise>

        <div style={{ height: 110 }} />

        {/* Badge */}
        <Pop delay={8} style={{ alignSelf: "flex-start" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 30px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.16)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: COLORS.neon400,
                boxShadow: `0 0 18px ${COLORS.neon400}`,
                transform: `scale(${dotPulse})`,
              }}
            />
            <div
              style={{
                fontSize: 29,
                fontWeight: 800,
                letterSpacing: 3.5,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {BRAND.badge}
            </div>
          </div>
        </Pop>

        {/* Headline — one word per line so it can go huge */}
        <div style={{ marginTop: 58 }}>
          <Words
            parts={[{ text: "Learn" }]}
            delay={14}
            fontSize={HEADLINE_SIZE}
          />
          <Words
            parts={[{ text: "Faster.", accent: "orange" }]}
            delay={24}
            fontSize={HEADLINE_SIZE}
          />
          <Words
            parts={[{ text: "Create" }]}
            delay={36}
            fontSize={HEADLINE_SIZE}
          />
          <Words
            parts={[{ text: "Smarter." }]}
            delay={46}
            fontSize={HEADLINE_SIZE}
          />
          <div style={{ marginTop: 26 }}>
            <Words
              parts={[
                { text: "Grow" },
                { text: "with" },
                { text: "AI.", accent: "neon" },
              ]}
              delay={56}
              stagger={5}
              fontSize={104}
            />
          </div>
        </div>

        {/* Sub-copy */}
        <Rise delay={66} style={{ marginTop: 52 }}>
          <div
            style={{
              fontSize: 38,
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 860,
            }}
          >
            AI prompt packs · Canva templates
            <br />
            eBooks · Business tools
          </div>
        </Rise>

        {/* Bouncing chevron — "keep watching" */}
        <div
          style={{
            marginTop: "auto",
            alignSelf: "center",
            opacity: frame > 72 ? 1 : 0,
            transform: `translateY(${chevronBounce}px)`,
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.25)",
            backgroundColor: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronDownIcon size={36} color={COLORS.orange400} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
