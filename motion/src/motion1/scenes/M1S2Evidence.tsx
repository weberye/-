import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import content from "../../data/content.json";
import { colors, fonts } from "../../lib/theme";
import { progress } from "../../lib/anim";
import { Reveal } from "../../components/Reveal";
import { CountUp } from "../../components/CountUp";
import { SourceNote } from "../../components/SourceNote";
import { L, rowTop } from "../layout";

type Stat = {
  type: "stat";
  value: number;
  decimals: number;
  unit: string;
  barPercent: number;
  label: string;
  source: string;
};
type Quote = { type: "quote"; quote: string; speaker: string; source: string };

const StatBody: React.FC<{ e: Stat }> = ({ e }) => {
  const frame = useCurrentFrame();
  const bar = progress(frame, 0.6, 1.4);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 40, height: "100%" }}>
      <CountUp
        at={0.3}
        value={e.value}
        decimals={e.decimals}
        unit={e.unit}
        style={{
          fontFamily: fonts.serif,
          fontWeight: 900,
          fontSize: 96,
          color: colors.primary,
          minWidth: 300,
          flexShrink: 0,
          lineHeight: 1,
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: 40, color: colors.ink }}>
          {e.label}
        </div>
        <div style={{ height: 14, borderRadius: 7, background: colors.line, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, e.barPercent)) * bar}%`,
              background: colors.primary,
              borderRadius: 7,
            }}
          />
        </div>
        <Reveal at={0.9} shift={0}>
          <SourceNote>{e.source}</SourceNote>
        </Reveal>
      </div>
    </div>
  );
};

const QuoteBody: React.FC<{ e: Quote }> = ({ e }) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, height: "100%" }}>
    <Reveal at={0.3}>
      <div style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: 44, lineHeight: 1.3, color: colors.ink }}>
        <span style={{ color: colors.primary, fontWeight: 700 }}>「</span>
        {e.quote}
        <span style={{ color: colors.primary, fontWeight: 700 }}>」</span>
      </div>
    </Reveal>
    <Reveal at={0.9} shift={0}>
      <SourceNote>
        {e.speaker}　{e.source}
      </SourceNote>
    </Reveal>
  </div>
);

/** Scene 2：右欄證據卡（每列一個，從自己的起點開始） */
export const M1S2Evidence: React.FC<{ index: number }> = ({ index }) => {
  const row = content.motion1.rows[index];
  const e = row.evidence as Stat | Quote;
  const inset = 18;
  return (
    <AbsoluteFill>
      <Reveal
        at={0}
        dur={0.9}
        shift={16}
        style={{
          position: "absolute",
          left: L.rightX,
          top: rowTop(index) + inset,
          width: L.rightW,
          height: L.rowH - inset * 2,
          background: colors.card,
          borderRadius: 24,
          boxShadow: "0 6px 24px rgba(60, 40, 20, 0.08)",
          padding: "20px 40px",
          boxSizing: "border-box",
        }}
      >
        {e.type === "stat" ? <StatBody e={e} /> : <QuoteBody e={e} />}
      </Reveal>
    </AbsoluteFill>
  );
};
