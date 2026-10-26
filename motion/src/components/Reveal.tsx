import React from "react";
import { useCurrentFrame } from "remotion";
import { progress } from "../lib/anim";

/** 淡入＋微幅上移（預設 12px） */
export const Reveal: React.FC<{
  at: number;
  dur?: number;
  shift?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, dur = 0.8, shift = 12, style, children }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, dur);
  return (
    <div style={{ ...style, opacity: p, transform: `translateY(${(1 - p) * shift}px)` }}>
      {children}
    </div>
  );
};
