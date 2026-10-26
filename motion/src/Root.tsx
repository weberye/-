import React from "react";
import { Composition } from "remotion";
import { FPS, WIDTH, HEIGHT } from "./lib/theme";
import { sec } from "./lib/anim";
import { Motion1 } from "./motion1/Motion1";
import { M1_TIMING } from "./motion1/layout";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Motion1"
      component={Motion1}
      durationInFrames={sec(M1_TIMING.total)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
