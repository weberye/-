import content from "../data/content.json";

const m1 = content.motion1;

// 表格版面（1920×1080）
export const L = {
  padX: 120,
  tableTop: 270,
  headerH: 80,
  rowH: 220,
  leftX: 120,
  leftW: 580,
  dividerX: 730,
  rightX: 760,
  rightW: 1040,
  right: 1800,
};

export const rowTop = (i: number) => L.tableTop + L.headerH + i * L.rowH;

// 依 content.json 的秒數算出各 scene 起點（秒）
const s = m1.seconds;
const evidenceStart = s.hypotheses;
const evidenceStarts = s.evidence.map(
  (_, i) => evidenceStart + s.evidence.slice(0, i).reduce((a, b) => a + b, 0),
);
const strikeStart = evidenceStart + s.evidence.reduce((a, b) => a + b, 0);
const reframeStart = strikeStart + s.strike;

export const M1_TIMING = {
  hypotheses: { start: 0, dur: s.hypotheses },
  evidence: evidenceStarts.map((start, i) => ({ start, dur: s.evidence[i] })),
  strike: { start: strikeStart, dur: s.strike },
  reframe: { start: reframeStart, dur: s.reframe },
  total: reframeStart + s.reframe,
};
