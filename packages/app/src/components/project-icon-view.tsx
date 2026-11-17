import { useMemo } from "react";
import { PastelFolder } from "@/components/icons/folder";
import { ProjectIconImage } from "@/components/project-icon-image";

/**
 * Corner radius of the *generated* project icon — the colored square with an initial — as a
 * fraction of the box, so it reads as the same shape at 16pt in the sidebar and 40pt in the edit
 * sheet. Fixed tokens did not give that: the radius scale is coarse at the bottom, so small icons
 * landed on 2pt and looked square while large ones were visibly rounder.
 *
 * This is ours to shape. A **user-uploaded icon is never rounded** — it is someone's mark, and
 * clipping its corners distorts branding we don't own. A square logo stays square, a round one is
 * already round.
 */
const RADIUS_RATIO = 0.25;

export function projectIconRadius(size: number): number {
  return Math.round(size * RADIUS_RATIO);
}

/**
 * A project's icon: its chosen image, or a pastel folder colored by the project's key.
 *
 * Geometry lives here, not at the call site: pass a `size` and the shape follows.
 */
export function ProjectIconView({
  iconDataUri,
  projectViewKey,
  size,
}: {
  iconDataUri: string | null;
  projectViewKey: string;
  size: number;
}) {
  // The uploaded image is sized but never clipped — see projectIconRadius.
  const box = useMemo(() => ({ width: size, height: size }), [size]);
  const fallback = useMemo(
    () => <PastelFolder colorKey={projectViewKey} size={size} />,
    [projectViewKey, size],
  );

  return iconDataUri ? (
    <ProjectIconImage dataUri={iconDataUri} fallback={fallback} style={box} />
  ) : (
    fallback
  );
}
