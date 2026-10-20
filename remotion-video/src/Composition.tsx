import { Composition } from "remotion";
import { Promo } from "./Promo";
import { TOTAL_FRAMES, VIDEO } from "./theme";

/**
 * "JMMajiwaPromo" — 1080×1920 (9:16), 30fps, 450 frames = 15 seconds.
 * Render with:  npx remotion render JMMajiwaPromo renders/jm-panda-promo.mp4
 */
export const PromoComposition: React.FC = () => (
  <Composition
    id="JMMajiwaPromo"
    component={Promo}
    durationInFrames={TOTAL_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
