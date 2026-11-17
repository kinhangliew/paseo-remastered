import { memo } from "react";
import Svg, { Path } from "react-native-svg";
import { withUnistyles } from "react-native-unistyles";
import { deriveFolderColorName } from "@/styles/identity-colors";
import type { FolderPalette } from "@/styles/theme";

// The canvas's 20×20 folder: a body with the tab notch, and a 55% line across it for the tab edge.
const FOLDER_BODY =
  "M2.6 5.8c0-.9.7-1.6 1.6-1.6h3.5l1.7 1.7h6.4c.9 0 1.6.7 1.6 1.6v7.7c0 .9-.7 1.6-1.6 1.6H4.2c-.9 0-1.6-.7-1.6-1.6z";
const FOLDER_TAB_EDGE = "M2.6 8.6h14.8";

interface FolderSvgProps {
  /** Hashed to pick the color, so one project or directory keeps one folder color. */
  colorKey: string;
  size: number;
  palette: FolderPalette;
}

function FolderSvg({ colorKey, size, palette }: FolderSvgProps) {
  const swatch = palette[deriveFolderColorName(colorKey)];
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path
        d={FOLDER_BODY}
        fill={swatch.fill}
        stroke={swatch.stroke}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Path d={FOLDER_TAB_EDGE} stroke={swatch.stroke} strokeWidth={1.1} opacity={0.55} />
    </Svg>
  );
}

/** A pastel two-tone folder: the icon for projects and directories, whatever the file icon style. */
export const PastelFolder = memo(
  withUnistyles(FolderSvg, (theme) => ({ palette: theme.colors.folder })),
);
