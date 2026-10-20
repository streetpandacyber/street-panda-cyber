import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { COLORS, VIDEO } from "../theme";

/**
 * Animated navy backdrop shared by every scene:
 * deep-navy gradient, drifting glow orbs, a faint moving grid and
 * slowly rising particles. Particle placement uses Remotion's seeded
 * `random()` so every render (and every frame) is deterministic.
 */

const PARTICLE_COUNT = 26;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: random(`particle-x-${i}`) * VIDEO.width,
  baseY: random(`particle-y-${i}`) * VIDEO.height,
  speed: 0.5 + random(`particle-speed-${i}`) * 1.3,
  size: 3 + random(`particle-size-${i}`) * 5,
  warm: i % 4 === 0,
}));

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const orbDriftX = Math.sin(frame / 90) * 36;
  const orbDriftY = Math.cos(frame / 110) * 28;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.navy900} 0%, ${COLORS.navy800} 52%, ${COLORS.navy900} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Faint grid, slowly scrolling down */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `0 ${(frame * 0.35) % 72}px`,
          opacity: 0.7,
        }}
      />

      {/* Orange glow, top right */}
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          right: -260,
          top: -240,
          background:
            "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(249,115,22,0) 68%)",
          transform: `translate(${orbDriftX}px, ${orbDriftY}px)`,
        }}
      />

      {/* Indigo glow, bottom left */}
      <div
        style={{
          position: "absolute",
          width: 880,
          height: 880,
          borderRadius: "50%",
          left: -340,
          bottom: -320,
          background:
            "radial-gradient(circle, rgba(38,52,160,0.85) 0%, rgba(38,52,160,0) 68%)",
          transform: `translate(${-orbDriftY}px, ${-orbDriftX}px)`,
        }}
      />

      {/* Rising particles */}
      {particles.map((particle, i) => {
        const y =
          (((particle.baseY - frame * particle.speed) % VIDEO.height) +
            VIDEO.height) %
          VIDEO.height;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: particle.x,
              top: y,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: particle.warm
                ? COLORS.orange400
                : COLORS.white,
              opacity: particle.warm ? 0.5 : 0.28,
            }}
          />
        );
      })}

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(2,6,24,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
