import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import content from "../../data/content.json";
import { colors } from "../../lib/theme";
import { progress } from "../../lib/anim";
import { HypothesisCell } from "../HypothesisCell";
import { L, rowTop } from "../layout";

/** Scene 3：左欄假設依序變淡並被劃掉 */
export const M1S3Strike: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = content.motion1.rows;
  return (
    <AbsoluteFill>
      {rows.map((r, i) => {
        const at = 0.5 + i * 1.6;
        const fade = progress(frame, at, 0.8);
        return (
          <React.Fragment key={r.key}>
            {/* 用底色半透明蓋住左欄，讓文字退成灰 */}
            <div
              style={{
                position: "absolute",
                left: L.leftX,
                top: rowTop(i) + 2,
                width: L.leftW,
                height: L.rowH - 4,
                background: colors.bg,
                opacity: fade * 0.6,
              }}
            />
            <HypothesisCell
              index={i}
              keyLabel={r.key}
              text={r.hypothesis}
              strike={{ at: at + 0.2, dur: 0.8 }}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
