import { StyleSheet } from "react-native-unistyles";
import type { SidebarSurfaceBackdrop } from "@/styles/surface-backdrop";

// 8pt of green with a 2pt ring in the row's own color, so the dot reads as cut out of the icon.
export const RUNNING_DOT_SIZE = 8;
const RING_WIDTH = 2;

export const runningDotStyles = StyleSheet.create((theme) => ({
  anchor: {
    position: "absolute",
    right: -2,
    bottom: -1,
    width: RUNNING_DOT_SIZE + RING_WIDTH * 2,
    height: RUNNING_DOT_SIZE + RING_WIDTH * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: RUNNING_DOT_SIZE,
    height: RUNNING_DOT_SIZE,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.runningDot,
  },
  dot: {
    width: RUNNING_DOT_SIZE + RING_WIDTH * 2,
    height: RUNNING_DOT_SIZE + RING_WIDTH * 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: RING_WIDTH,
    backgroundColor: theme.colors.runningDot,
  },
  ringOnSidebar: { borderColor: theme.colors.surfaceSidebar },
  ringOnSidebarHover: { borderColor: theme.colors.surfaceSidebarHover },
  ringOnSidebarSelected: { borderColor: theme.colors.surfaceSidebarSelected },
  ringOnSurface2: { borderColor: theme.colors.surface2 },
}));

export function runningDotRingStyle(backdrop: SidebarSurfaceBackdrop) {
  switch (backdrop) {
    case "surfaceSidebar":
      return runningDotStyles.ringOnSidebar;
    case "surfaceSidebarHover":
      return runningDotStyles.ringOnSidebarHover;
    case "surfaceSidebarSelected":
      return runningDotStyles.ringOnSidebarSelected;
    case "surface2":
      return runningDotStyles.ringOnSurface2;
  }
}

export interface RunningDotProps {
  /** The row's current background, so the ring knocks out of it. */
  backdrop: SidebarSurfaceBackdrop;
}
