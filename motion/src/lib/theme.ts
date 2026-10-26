import { continueRender, delayRender } from "remotion";
import "@fontsource/noto-sans-tc/400.css";
import "@fontsource/noto-sans-tc/500.css";
import "@fontsource/noto-sans-tc/700.css";
import "@fontsource/noto-serif-tc/700.css";
import "@fontsource/noto-serif-tc/900.css";
import content from "../data/content.json";

export const colors = content.brand.colors;

// 字型已打包在專案內（@fontsource），離線也能輸出
export const fonts = {
  sans: "'Noto Sans TC', sans-serif",
  serif: "'Noto Serif TC', serif",
};

// 中文字型依字元切片載入：把 content.json 的所有文字丟進去，確保每個字都先載好才開始截圖
const collectText = (v: unknown): string =>
  typeof v === "string"
    ? v
    : Array.isArray(v)
      ? v.map(collectText).join("")
      : v && typeof v === "object"
        ? Object.values(v).map(collectText).join("")
        : String(v ?? "");

const allText = collectText(content) + "0123456789.,%+-NT$「」";
const faces = [
  "400 40px 'Noto Sans TC'",
  "500 40px 'Noto Sans TC'",
  "700 40px 'Noto Sans TC'",
  "700 40px 'Noto Serif TC'",
  "900 40px 'Noto Serif TC'",
];
const fontHandle = delayRender("載入中文字型");
Promise.all(faces.map((f) => document.fonts.load(f, allText)))
  .then(() => continueRender(fontHandle))
  .catch((err) => {
    console.error(err);
    continueRender(fontHandle);
  });

// 教室投影：最小字級 36px
export const type = {
  min: 36,
  body: 44,
  lead: 56,
  title: 80,
  hero: 112,
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
