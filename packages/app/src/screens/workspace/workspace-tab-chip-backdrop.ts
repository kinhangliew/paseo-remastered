import type { SurfaceBackdrop } from "@/styles/surface-backdrop";

/** The surface a tab rail paints: a pane header or the Explorer sidebar. */
export type WorkspaceTabRailSurface = "surface" | "sidebar";

/**
 * The fill of a tab chip, named as the surface token it paints so the chip style and everything
 * knocking out of it (the running-status ring, the trailing-action scrim) agree.
 *
 * Tabs sit on a gray track (`resolveWorkspaceTabTrack`). Each rail climbs one ladder from the
 * track: resting, filled (hovered, or active in an unfocused pane), and the active tab of the
 * focused pane as the white pill.
 */
export function resolveWorkspaceTabChipBackdrop({
  rail,
  isActiveFocused,
  isFilled,
}: {
  rail: WorkspaceTabRailSurface;
  isActiveFocused: boolean;
  isFilled: boolean;
}): SurfaceBackdrop {
  if (isActiveFocused) return "surfacePill";
  if (rail === "sidebar") {
    return isFilled ? "surfaceSidebarSelected" : "surfaceSidebarHover";
  }
  return isFilled ? "surfaceSidebarHover" : "surfaceSidebar";
}

/** The track behind a rail's tabs: one step off the surface the rail sits on. */
export function resolveWorkspaceTabTrack(rail: WorkspaceTabRailSurface): SurfaceBackdrop {
  return rail === "sidebar" ? "surfaceSidebarHover" : "surfaceSidebar";
}
