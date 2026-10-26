import React from "react";
import { colors, fonts, type } from "../lib/theme";

/** 資料來源小字（仍維持投影最小 36px） */
export const SourceNote: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: fonts.sans,
      fontSize: type.min,
      fontWeight: 400,
      color: colors.muted,
      lineHeight: 1.2,
      ...style,
    }}
  >
    {children}
  </div>
);
