import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, fonts } from "../lib/theme";
import { progress } from "../lib/anim";
import { L, rowTop } from "./layout";

/**
 * 左欄假設儲存格。
 * strike 模式會用同樣排版畫一層透明文字，讓劃線長度剛好等於文字寬度。
 */
export const HypothesisCell: React.FC<{
  index: number;
  keyLabel: string;
  text: string;
  strike?: { at: number; dur: number };
}> = ({ index, keyLabel, text, strike }) => {
  const frame = useCurrentFrame();
  const p = strike ? progress(frame, strike.at, strike.dur) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: L.leftX,
        top: rowTop(index),
        width: L.leftW,
        height: L.rowH,
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: fonts.serif,
          fontWeight: 900,
          fontSize: 56,
          width: 52,
          color: strike ? "transparent" : colors.primary,
        }}
      >
        {keyLabel}
      </div>
      <div
        style={{
          fontFamily: fonts.sans,
          fontWeight: 700,
          fontSize: 48,
          lineHeight: 1.3,
          color: strike ? "transparent" : colors.ink,
          flex: 1,
        }}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          {text}
          {strike && (
            <span
              style={{
                position: "absolute",
                left: -8,
                top: "52%",
                height: 6,
                width: `calc(${p * 100}% + ${p * 16}px)`,
                background: colors.primary,
                borderRadius: 3,
              }}
            />
          )}
        </span>
      </div>
    </div>
  );
};
