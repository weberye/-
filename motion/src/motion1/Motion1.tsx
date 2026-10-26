import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { colors } from "../lib/theme";
import { sec } from "../lib/anim";
import { Halftone } from "../components/Halftone";
import { M1S1Hypotheses } from "./scenes/M1S1Hypotheses";
import { M1S2Evidence } from "./scenes/M1S2Evidence";
import { M1S3Strike } from "./scenes/M1S3Strike";
import { M1S4Reframe } from "./scenes/M1S4Reframe";
import { M1_TIMING as T } from "./layout";

/**
 * 表格會一路累積在畫面上，所以每個 scene 從自己的起點開始、一直保留到片尾；
 * 後面的 scene 疊在前面的上方。
 */
export const Motion1: React.FC = () => (
  <AbsoluteFill style={{ background: colors.bg }}>
    <Halftone corner="top-right" />
    <Sequence from={sec(T.hypotheses.start)} name="1 客戶假設">
      <M1S1Hypotheses />
    </Sequence>
    {T.evidence.map((e, i) => (
      <Sequence key={i} from={sec(e.start)} name={`2 證據 ${i + 1}`}>
        <M1S2Evidence index={i} />
      </Sequence>
    ))}
    <Sequence from={sec(T.strike.start)} name="3 劃掉假設">
      <M1S3Strike />
    </Sequence>
    <Sequence from={sec(T.reframe.start)} name="4 重新定義">
      <M1S4Reframe />
    </Sequence>
  </AbsoluteFill>
);
