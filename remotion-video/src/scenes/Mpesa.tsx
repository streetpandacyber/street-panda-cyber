import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import {
  BoltIcon,
  CheckIcon,
  DownloadIcon,
  Kicker,
  Pop,
  Rise,
  ShieldIcon,
  Words,
} from "../components/ui";
import { COLORS, SCENE_PADDING } from "../theme";

/**
 * Scene 3 — paying (7.0s–11.0s).
 * A phone mockup runs a mini checkout story: M-Pesa STK Push →
 * PIN dots fill → payment confirmed → download ready.
 *
 * Local-frame timing: PIN at 18/27/36/45, tick at 58, progress 68–90.
 * Everything finishes before frame 105, where the CTA slides over.
 */

const PinDot: React.FC<{ filledAt: number }> = ({ filledAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - filledAt,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.5 },
  });

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.4)",
        backgroundColor: COLORS.white,
        transform: `scale(${0.55 + progress * 0.45})`,
        opacity: 0.35 + progress * 0.65,
      }}
    />
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const confirmed = spring({
    frame: frame - 58,
    fps,
    config: { damping: 10, stiffness: 130, mass: 0.65 },
  });
  const ringScale = interpolate(frame, [58, 84], [0.7, 1.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  // Keyframed from 0 so the ring is invisible before the tick pops.
  const ringOpacity = interpolate(frame, [57, 58, 84], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const downloadProgress = interpolate(frame, [68, 90], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const buttonOpacity = interpolate(frame, [50, 57], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width: 520,
        height: 880,
        borderRadius: 64,
        border: "3px solid rgba(255,255,255,0.2)",
        background: `linear-gradient(180deg, #0d1547 0%, #070d33 100%)`,
        boxShadow: "0 50px 120px rgba(2,6,24,0.6)",
        padding: "52px 42px 42px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: 130,
          height: 22,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.14)",
        }}
      />

      {/* M-Pesa header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 14,
        }}
      >
        <div
          style={{
            padding: "10px 20px",
            borderRadius: 14,
            background: `linear-gradient(120deg, ${COLORS.neon400}, ${COLORS.neon500})`,
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: 1.5,
          }}
        >
          M-PESA
        </div>
        <div
          style={{ fontSize: 27, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}
        >
          STK Push
        </div>
      </div>

      {/* Payment details */}
      <div style={{ marginTop: 44 }}>
        <div style={{ fontSize: 29, color: "rgba(255,255,255,0.6)" }}>
          Pay JM Majiwa
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 38,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          AI Prompt Pack
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 58,
            fontWeight: 900,
            color: COLORS.orange400,
            letterSpacing: -1,
          }}
        >
          KSh 499
        </div>
      </div>

      {/* PIN entry */}
      <div style={{ marginTop: 46 }}>
        <div
          style={{
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          ENTER M-PESA PIN
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 22 }}>
          {[18, 27, 36, 45].map((filledAt) => (
            <PinDot key={filledAt} filledAt={filledAt} />
          ))}
        </div>
      </div>

      {/* Confirm → confirmed → downloaded */}
      <div
        style={{
          marginTop: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 150,
            width: "100%",
            padding: "24px 0",
            borderRadius: 22,
            textAlign: "center",
            fontSize: 33,
            fontWeight: 800,
            color: COLORS.white,
            background: `linear-gradient(120deg, ${COLORS.orange400}, ${COLORS.orange600})`,
            opacity: buttonOpacity,
          }}
        >
          Confirm Payment
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 128,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 118,
              height: 118,
              borderRadius: "50%",
              border: `3px solid ${COLORS.neon400}`,
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
            }}
          />
          <div
            style={{
              width: 118,
              height: 118,
              borderRadius: "50%",
              background: `linear-gradient(140deg, ${COLORS.neon400}, ${COLORS.neon500})`,
              boxShadow: `0 18px 44px rgba(34,197,94,0.45)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${confirmed})`,
              opacity: Math.min(1, confirmed * 1.8),
            }}
          >
            <CheckIcon size={62} color={COLORS.white} strokeWidth={3.2} />
          </div>
        </div>

        <Rise delay={66} y={24}>
          <div style={{ fontSize: 35, fontWeight: 800, textAlign: "center" }}>
            Payment confirmed
          </div>
        </Rise>

        <div
          style={{
            marginTop: 24,
            width: "100%",
            height: 15,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.13)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${downloadProgress}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${COLORS.neon400}, ${COLORS.neon300})`,
            }}
          />
        </div>

        <Rise delay={88} y={20}>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 27,
              fontWeight: 700,
              color: COLORS.neon300,
              whiteSpace: "nowrap",
            }}
          >
            <DownloadIcon size={30} color={COLORS.neon300} />
            Your download is ready
          </div>
        </Rise>
      </div>
    </div>
  );
};

/** Feature pill under the phone, with a gentle floating bob. */
const FeatureChip: React.FC<{
  delay: number;
  children: React.ReactNode;
}> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  const floatY = Math.sin((frame - delay) / 14) * 7;

  return (
    <Pop delay={delay}>
      <div
        style={{
          transform: `translateY(${floatY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 13,
          padding: "19px 30px",
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.07)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          boxShadow: "0 20px 44px rgba(2,6,24,0.45)",
          fontSize: 31,
          fontWeight: 800,
          color: COLORS.white,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </Pop>
  );
};

export const Mpesa: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <AbsoluteFill style={SCENE_PADDING}>
      <Rise delay={3} y={36}>
        <Kicker text="CHECKOUT IN SECONDS" color={COLORS.neon400} />
      </Rise>

      <div style={{ marginTop: 30 }}>
        <Words parts={[{ text: "Pay" }, { text: "with" }]} delay={8} fontSize={104} />
        <Words
          parts={[{ text: "M-Pesa.", accent: "neon" }]}
          delay={18}
          fontSize={104}
        />
      </div>

      <Rise
        delay={14}
        y={90}
        style={{ marginTop: 46, alignSelf: "center", position: "relative" }}
      >
        <Phone />
      </Rise>

      {/* Feature pills */}
      <div
        style={{
          marginTop: 42,
          display: "flex",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <FeatureChip delay={34}>
          <BoltIcon size={30} color={COLORS.orange400} filled />
          Instant delivery
        </FeatureChip>
        <FeatureChip delay={46}>
          <ShieldIcon size={30} color={COLORS.neon400} />
          Secure checkout
        </FeatureChip>
      </div>

      <Rise delay={84} y={30} style={{ marginTop: "auto" }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 37,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          No waiting. No hassle. Yours in seconds.
        </div>
      </Rise>
    </AbsoluteFill>
  </AbsoluteFill>
);
