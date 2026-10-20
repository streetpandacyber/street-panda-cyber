import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { Background } from "../components/Background";
import {
  ArrowRightIcon,
  LogoMark,
  MessageIcon,
  Pop,
  Rise,
  Words,
} from "../components/ui";
import {
  BRAND,
  COLORS,
  FONT_MONO,
  SCENE_PADDING,
  VIDEO,
} from "../theme";

/**
 * Scene 4 — the end card (10.5s–15.0s).
 * Confetti burst, big logo, pulsing SHOP NOW button, website + WhatsApp.
 * The last second is a slow push-in on the settled card, so the final
 * frame works as a screenshot/poster.
 */

const CONFETTI_COLORS = [
  COLORS.orange500,
  COLORS.orange300,
  COLORS.neon400,
  COLORS.indigo400,
  COLORS.white,
];

const confetti = Array.from({ length: 46 }, (_, i) => ({
  x: random(`confetti-x-${i}`) * VIDEO.width,
  delay: Math.floor(random(`confetti-delay-${i}`) * 22),
  fallFrames: 78 + random(`confetti-fall-${i}`) * 42,
  drift: (random(`confetti-drift-${i}`) - 0.5) * 180,
  spinSpeed: 3.5 + random(`confetti-spin-${i}`) * 7,
  width: 13 + random(`confetti-w-${i}`) * 11,
  height: 8 + random(`confetti-h-${i}`) * 8,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 5 === 0,
}));

const Confetti: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {confetti.map((piece, i) => {
        const local = frame - piece.delay;
        if (local < 0) {
          return null;
        }
        const y = interpolate(local, [0, piece.fallFrames], [-50, VIDEO.height + 50], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.quad),
        });
        const x = piece.x + Math.sin(local / 9 + i) * 26 + (piece.drift * local) / piece.fallFrames;
        const opacity = interpolate(
          local,
          [piece.fallFrames - 18, piece.fallFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: piece.width,
              height: piece.height,
              borderRadius: piece.round ? "50%" : 3,
              backgroundColor: piece.color,
              opacity: opacity * 0.9,
              transform: `rotate(${local * piece.spinSpeed}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const CTAButton: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 7) * 0.025;
  const arrowX = Math.sin(frame / 7) * 6;

  return (
    <Pop delay={38}>
      <div
        style={{
          transform: `scale(${pulse})`,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "34px 78px",
          borderRadius: 999,
          background: `linear-gradient(120deg, ${COLORS.orange400} 0%, ${COLORS.orange500} 55%, ${COLORS.orange600} 100%)`,
          boxShadow: "0 26px 80px rgba(249,115,22,0.5)",
          fontSize: 54,
          fontWeight: 900,
          letterSpacing: 1,
        }}
      >
        SHOP NOW
        <span style={{ display: "flex", transform: `translateX(${arrowX}px)` }}>
          <ArrowRightIcon size={46} color={COLORS.white} strokeWidth={3} />
        </span>
      </div>
    </Pop>
  );
};

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const pushIn = interpolate(frame, [92, 135], [1, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <AbsoluteFill>
      <Background />
      <Confetti />
      <AbsoluteFill style={SCENE_PADDING}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            transform: `scale(${pushIn})`,
          }}
        >
          <Pop delay={4}>
            <LogoMark size={196} />
          </Pop>

          <div style={{ marginTop: 46 }}>
            <Words
              parts={[{ text: "JM" }, { text: "Street" }]}
              delay={14}
              stagger={6}
              fontSize={112}
              align="center"
            />
          </div>

          <Rise delay={26} y={34} style={{ marginTop: 30 }}>
            <div
              style={{
                fontSize: 43,
                lineHeight: 1.4,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Learn Faster. Create Smarter.
              <br />
              Grow with <span style={{ color: COLORS.neon400, fontWeight: 800 }}>AI</span>.
            </div>
          </Rise>

          <div style={{ marginTop: 58 }}>
            <CTAButton />
          </div>

          <Rise delay={50} y={28} style={{ marginTop: 44 }}>
            <div
              style={{
                padding: "20px 42px",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                fontFamily: FONT_MONO,
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {BRAND.url}
            </div>
          </Rise>

          <Rise delay={60} y={28} style={{ marginTop: 26 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 36px",
                borderRadius: 999,
                backgroundColor: "rgba(57,211,83,0.12)",
                border: "1.5px solid rgba(57,211,83,0.4)",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              <MessageIcon size={34} color={COLORS.neon400} />
              WhatsApp · {BRAND.WhatsApp}
            </div>
          </Rise>
        </div>

        <Rise delay={70} y={20}>
          <div
            style={{
              textAlign: "center",
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: 2.5,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            PAY WITH M-PESA · INSTANT DOWNLOAD
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
