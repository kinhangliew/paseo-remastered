import { memo } from "react";
import Svg, { Path } from "react-native-svg";
import { withUnistyles } from "react-native-unistyles";
import { GLYPH_PATHS, resolveFileGlyph } from "./file-glyph";

// A page with a folded corner, from the canvas's `Kit.dc.html`, on a 20×20 box.
const PAGE = "M5.6 2.6h5.8l3.6 3.6v10.2c0 .6-.5 1-1 1H5.6c-.6 0-1-.4-1-1V3.6c0-.6.4-1 1-1z";
const FOLD = "M11.4 2.6v3.6H15";

interface OutlineFileSvgProps {
  fileName: string;
  size: number;
  fill: string;
  outline: string;
  glyph: string;
}

function OutlineFileSvg({ fileName, size, fill, outline, glyph }: OutlineFileSvgProps) {
  const glyphName = resolveFileGlyph(fileName);
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d={PAGE} fill={fill} stroke={outline} strokeWidth={1.1} strokeLinejoin="round" />
      <Path d={FOLD} stroke={outline} strokeWidth={1.1} strokeLinejoin="round" />
      {glyphName === null ? null : (
        <Path
          d={GLYPH_PATHS[glyphName]}
          stroke={glyph}
          strokeWidth={1.15}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

/** An outlined page with a small glyph for the file's kind: the default file icon style. */
export const OutlineFileIcon = memo(
  withUnistyles(OutlineFileSvg, (theme) => ({
    fill: theme.colors.iconFill,
    outline: theme.colors.iconOutline,
    glyph: theme.colors.iconGlyph,
  })),
);
