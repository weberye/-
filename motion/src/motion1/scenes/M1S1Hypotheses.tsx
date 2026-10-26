import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import content from "../../data/content.json";
import { colors, fonts, type } from "../../lib/theme";
import { progress } from "../../lib/anim";
import { Reveal } from "../../components/Reveal";
import { HypothesisCell } from "../HypothesisCell";
import { L, rowTop } from "../layout";

const m1 = content.motion1;

/** Scene 1：大標、表格框線、左欄客戶假設依序出現 */
export const M1S1Hypotheses: React.FC = () => {
  const frame = useCurrentFrame();
  const headerLine = progress(frame, 1.0, 1.2);
  const divider = progress(frame, 1.4, 1.4);
  const rowsCount = m1.rows.length;

  return (
    <AbsoluteFill>
      <Reveal at={0.2} style={{ position: "absolute", left: L.padX, top: 64 }}>
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: type.min,
            color: colors.primary,
            letterSpacing: "0.12em",
          }}
        >
          {m1.eyebrow}
        </div>
      </Reveal>
      <Reveal at={0.4} dur={1} style={{ position: "absolute", left: L.padX, top: 116 }}>
        <div
          style={{
            fontFamily: fonts.serif,
            fontWeight: 900,
            fontSize: type.title,
            color: colors.ink,
            lineHeight: 1.15,
          }}
        >
          {m1.headline}
        </div>
      </Reveal>

      {/* 欄位標題 */}
      {[
        { x: L.leftX, label: m1.columns.left, at: 1.2 },
        { x: L.rightX, label: m1.columns.right, at: 1.5 },
      ].map((c) => (
        <Reveal
          key={c.label}
          at={c.at}
          style={{
            position: "absolute",
            left: c.x,
            top: L.tableTop,
            height: L.headerH,
            display: "flex",
            alignItems: "center",
            fontFamily: fonts.serif,
            fontWeight: 700,
            fontSize: 40,
            color: colors.ink,
          }}
        >
          {c.label}
        </Reveal>
      ))}

      {/* 表頭底線 */}
      <div
        style={{
          position: "absolute",
          left: L.leftX,
          top: L.tableTop + L.headerH - 2,
          height: 4,
          width: (L.right - L.leftX) * headerLine,
          background: colors.ink,
        }}
      />
      {/* 列分隔線 */}
      {Array.from({ length: rowsCount }).map((_, i) => {
        const p = progress(frame, 1.6 + i * 0.15, 1.2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: L.leftX,
              top: rowTop(i + 1) - 1,
              height: 2,
              width: (L.right - L.leftX) * p,
              background: colors.line,
            }}
          />
        );
      })}
      {/* 欄分隔線 */}
      <div
        style={{
          position: "absolute",
          left: L.dividerX,
          top: L.tableTop + L.headerH,
          width: 2,
          height: L.rowH * rowsCount * divider,
          background: colors.line,
        }}
      />

      {/* 假設逐條出現：2.2s 起每隔 1 秒一條 */}
      {m1.rows.map((r, i) => (
        <Reveal key={r.key} at={2.2 + i * 1.0} dur={0.9} shift={16}>
          <HypothesisCell index={i} keyLabel={r.key} text={r.hypothesis} />
        </Reveal>
      ))}
    </AbsoluteFill>
  );
};
