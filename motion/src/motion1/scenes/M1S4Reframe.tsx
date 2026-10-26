import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import content from "../../data/content.json";
import { colors, fonts, type } from "../../lib/theme";
import { progress } from "../../lib/anim";
import { Reveal } from "../../components/Reveal";

/** Scene 4：表格退成淡色，浮現 Problem Definition */
export const M1S4Reframe: React.FC = () => {
  const frame = useCurrentFrame();
  const veil = progress(frame, 0, 1.2);
  const accent = progress(frame, 0.9, 1.0);
  const r = content.motion1.reframe;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: colors.bg, opacity: veil * 0.85 }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Reveal
          at={0.6}
          dur={1.0}
          shift={16}
          style={{
            position: "relative",
            width: 1480,
            background: colors.card,
            borderRadius: 28,
            boxShadow: "0 10px 40px rgba(60, 40, 20, 0.10)",
            padding: "72px 96px 80px 112px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 16,
              height: `${accent * 100}%`,
              background: colors.primary,
            }}
          />
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 700,
              fontSize: type.min,
              color: colors.primary,
              letterSpacing: "0.12em",
              marginBottom: 28,
            }}
          >
            {r.eyebrow}
          </div>
          <Reveal at={1.1} dur={1.0}>
            <div
              style={{
                fontFamily: fonts.serif,
                fontWeight: 900,
                fontSize: type.title,
                lineHeight: 1.3,
                color: colors.ink,
              }}
            >
              {r.problemDefinition}
            </div>
          </Reveal>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
