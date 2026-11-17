import { memo } from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { withUnistyles } from "react-native-unistyles";
import { densityIconProps } from "@/styles/density";

export type WorkspaceTileKind = "checkout" | "worktree";

// Glyphs from the canvas's `Main.dc.html`, on a 20×20 box.
const GLYPHS: Record<WorkspaceTileKind, string> = {
  checkout: "M6.4 7.2h7.2v4.6H6.4zM8.6 14h2.8",
  worktree: "M7.6 6.6v6.8M12.4 6.6v1.2c0 1.8-4.8 1.6-4.8 3.6",
};

interface WorkspaceTileSvgProps {
  kind: WorkspaceTileKind;
  size: number;
  fill: string;
  outline: string;
  glyph: string;
}

function WorkspaceTileSvg({ kind, size, fill, outline, glyph }: WorkspaceTileSvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x={2.8}
        y={3.4}
        width={14.4}
        height={13.2}
        rx={3}
        fill={fill}
        stroke={outline}
        strokeWidth={1.1}
      />
      <Path
        d={GLYPHS[kind]}
        stroke={glyph}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * A workspace's icon at the sidebar's `md` icon size: a rounded tile with a monitor for a local
 * checkout, a branch for a worktree.
 */
export const WorkspaceTile = memo(
  withUnistyles(
    WorkspaceTileSvg,
    densityIconProps("md", (theme) => ({
      fill: theme.colors.iconFill,
      outline: theme.colors.iconOutline,
      glyph: theme.colors.iconGlyph,
    })),
  ),
);
