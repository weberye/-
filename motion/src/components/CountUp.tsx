import React from "react";
import { useCurrentFrame } from "remotion";
import { progress } from "../lib/anim";

export const CountUp: React.FC<{
  at: number;
  dur?: number;
  value: number;
  decimals?: number;
  unit?: string;
  style?: React.CSSProperties;
}> = ({ at, dur = 1.6, value, decimals = 0, unit = "", style }) => {
  const frame = useCurrentFrame();
  const v = value * progress(frame, at, dur);
  const text = v.toLocaleString("zh-TW", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {value === 0 ? "00" : text}
      {unit}
    </span>
  );
};
