import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../lib/theme";
import { progress } from "../lib/anim";

type Corner = "top-right" | "bottom-left";

/** 半調網點：圓點大小沿對角線由大到小，作為背景紋理（非圖示） */
export const Halftone: React.FC<{ corner?: Corner; fadeInSec?: number }> = ({
  corner = "top-right",
  fadeInSec = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(progress(frame, fadeInSec, 1.5), [0, 1], [0, 0.55]);

  // 網點只佔角落約 680×300 的範圍，避免壓到內容
  const step = 28;
  const cols = 25;
  const rows = 11;
  const radius = 700;
  const dots: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // 離角落越遠點越小
      const d = Math.hypot(x * step, y * step * 2.2) / radius;
      const r = (step / 2) * Math.max(0, 0.9 - d * 0.95);
      if (r < 1) continue;
      const cx = corner === "top-right" ? 1920 - x * step - step / 2 : x * step + step / 2;
      const cy = corner === "top-right" ? y * step + step / 2 : 1080 - y * step - step / 2;
      dots.push(<circle key={`${x}-${y}`} cx={cx} cy={cy} r={r} />);
    }
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={1920} height={1080} fill={colors.primary}>
        {dots}
      </svg>
    </AbsoluteFill>
  );
};
