import { Easing, interpolate } from "remotion";
import { FPS } from "./theme";

export const sec = (s: number) => Math.round(s * FPS);

// 只用 ease-out，不做彈跳
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 的進度，從 startSec 開始，歷時 durSec */
export const progress = (frame: number, startSec: number, durSec: number) =>
  interpolate(frame, [sec(startSec), sec(startSec + durSec)], [0, 1], {
    easing: easeOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
