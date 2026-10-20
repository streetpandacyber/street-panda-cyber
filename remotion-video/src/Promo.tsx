import { Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Mpesa } from "./scenes/Mpesa";
import { Products } from "./scenes/Products";
import { SCENE_FRAMES, TRANSITION_FRAMES } from "./theme";

/**
 * The full 15-second timeline. Scenes overlap by TRANSITION_FRAMES (15)
 * with smooth eased transitions:
 *   Hook ──slide──▶ Products ──fade──▶ M-Pesa ──slide-up──▶ CTA
 * Total: 105 + 135 + 120 + 135 − 3×15 = 450 frames @30fps = 15.0s.
 */

const smooth = () =>
  linearTiming({
    durationInFrames: TRANSITION_FRAMES,
    easing: Easing.inOut(Easing.ease),
  });

export const Promo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.hook}>
      <Hook />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={smooth()}
    />

    <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.products}>
      <Products />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={smooth()} />

    <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.mpesa}>
      <Mpesa />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-bottom" })}
      timing={smooth()}
    />

    <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.cta}>
      <Cta />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
