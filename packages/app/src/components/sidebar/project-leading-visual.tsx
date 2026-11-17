import { ActivityIndicator, View, type ViewStyle } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { ChevronRight, CircleAlert } from "lucide-react-native";
import { DisclosureRotation } from "@/components/ui/disclosure/view";
import { ProjectIconView } from "@/components/project-icon-view";
import { getStatusBucketLabel } from "@/hooks/sidebar-status-view-model";
import { densityIconBox, densityIconProps } from "@/styles/density";
import type { Theme } from "@/styles/theme";
import type { SidebarStateBucket } from "@/utils/sidebar-agent-state";
import {
  getProjectStatusBadgeContent,
  type ProjectStatusBadgeContent,
  type ProjectStatusBadgeDotBucket,
} from "@/utils/project-status-badge-content";
import { getStatusDotColor } from "@/utils/status-dot-color";
import {
  STATUS_INDICATOR_ALERT_SIZE,
  STATUS_INDICATOR_FILLED_DOT_SIZE,
} from "@/utils/status-indicator-geometry";
import { RunningDot } from "@/components/icons/running-dot";
import type { SidebarSurfaceBackdrop } from "@/styles/surface-backdrop";

// Every surfaced status shares one badge shell, so the badge never changes size or position
// between states. Only the thing inside it changes.
// Matches the workspace title's lineHeight (sidebar-workspace-row-content's
// workspaceBranchText) so the icon centers on the title rather than floating above it.
const LEADING_SLOT_HEIGHT = 20;
const STATUS_BADGE_SIZE = 12;
// How far the badge overhangs the icon's bottom-right corner. Well short of half the badge:
// centered on the corner it reads as hanging off the icon rather than sitting on it, and the
// sidebar row has no padding there to absorb the overhang.
const STATUS_BADGE_OFFSET = -4;
// Both glyphs must be EVEN. A centered glyph of size N sits at a (12 - N) / 2 offset — fractional
// for odd N, which the browser snaps to a device-pixel boundary and renders visibly off-center (an
// odd size measured 1.5 device px right and down at 3x, ~3px of asymmetry between opposite gaps).
// Even sizes divide the shell into whole pixels and land dead center with no correction.
//
// The filled alert occupies the full badge shell so needs-input remains more prominent than
// the passive status dots.
const DensityProjectIconView = withUnistyles(ProjectIconView);
const projectIconProps = densityIconProps("md", () => ({}));

const ThemedActivityIndicator = withUnistyles(ActivityIndicator);
const ThemedCircleAlert = withUnistyles(CircleAlert);
const ThemedChevronRight = withUnistyles(ChevronRight);
const foregroundExtraMutedColorMapping = (theme: Theme) => ({
  color: theme.colors.foregroundExtraMuted,
});

const foregroundMutedColorMapping = (theme: Theme) => ({
  color: theme.colors.foregroundMuted,
});
const needsInputColorMapping = (theme: Theme) => ({
  color: theme.colors.surface0,
  fill: getStatusDotColor({ theme, bucket: "needs_input" }) ?? undefined,
});

/**
 * Leading slots of a sidebar project row: the disclosure chevron, then the project icon carrying
 * the project's aggregate workspace status (an archive spinner while the project is removed). A
 * project with nothing to disclose keeps the chevron's slot, so its icon stays on the rail.
 */
export function ProjectLeadingVisual({
  iconDataUri,
  statusBucket,
  projectViewKey,
  backdrop,
  chevron = null,
  isArchiving = false,
}: {
  iconDataUri: string | null;
  /** Aggregate status of the project's workspaces; null when it shouldn't be surfaced. */
  statusBucket: SidebarStateBucket | null;
  projectViewKey: string;
  /** The row's current background, so the status badge can knock out of it. */
  backdrop: SidebarSurfaceBackdrop;
  chevron?: "expand" | "collapse" | null;
  isArchiving?: boolean;
}) {
  return (
    <>
      <View style={styles.projectChevronSlot}>
        <ProjectInlineChevron chevron={chevron} />
      </View>
      {isArchiving ? (
        <View style={styles.projectLeadingVisualSlot} testID="project-status-indicator-archiving">
          <ThemedActivityIndicator size={8} uniProps={foregroundMutedColorMapping} />
        </View>
      ) : (
        <ProjectStatusIndicator
          iconDataUri={iconDataUri}
          projectViewKey={projectViewKey}
          statusBucket={statusBucket}
          backdrop={backdrop}
        />
      )}
    </>
  );
}

// The project icon (the lettered box) is what marks a row as a *project* rather than a
// workspace, so it always stays and status annotates it instead of replacing it. Every
// surfaced bucket lands in the identical corner badge — an amber alert glyph for needs_input,
// a colored disc for the rest, nothing for done — so the badge reads as one fixed shell and
// only its contents change.
export function ProjectStatusIndicator({
  iconDataUri,
  projectViewKey,
  statusBucket,
  backdrop,
  loading = false,
  testID,
}: {
  iconDataUri: string | null;
  projectViewKey: string;
  statusBucket: SidebarStateBucket | null;
  /** The row's current background, so the status badge can knock out of it. */
  backdrop: SidebarSurfaceBackdrop;
  loading?: boolean;
  testID?: string;
}) {
  // A row that's still starting up and a row that's working are both "busy", and at this size
  // there's no room to draw the difference — so `loading` just resolves to the running bucket
  // and they share one badge.
  const badgeBucket = loading ? "running" : statusBucket;
  const badgeContent = getProjectStatusBadgeContent(badgeBucket);

  return (
    <View
      style={styles.projectLeadingVisualSlot}
      testID={
        testID ??
        (statusBucket && statusBucket !== "done"
          ? `project-status-indicator-${statusBucket}`
          : "project-icon-only")
      }
    >
      <View style={styles.projectIconBox}>
        <ProjectIcon iconDataUri={iconDataUri} projectViewKey={projectViewKey} />
        {badgeContent === null || badgeBucket === null ? null : (
          <StatusCornerBadge
            content={badgeContent}
            statusBucket={badgeBucket}
            backdrop={backdrop}
          />
        )}
      </View>
    </View>
  );
}

/**
 * The status badge on the corner of a project or workspace icon. Running is the breathing green
 * dot; the other statuses sit in one knockout shell so the badge never changes size between them.
 */
export function StatusCornerBadge({
  content,
  statusBucket,
  backdrop,
}: {
  content: ProjectStatusBadgeContent;
  statusBucket: SidebarStateBucket;
  backdrop: SidebarSurfaceBackdrop;
}) {
  const { t } = useTranslation();
  // Running skips the shell: the dot carries its own knockout ring and its halo breathes past
  // the shell's edge.
  if (content.kind === "dot" && content.bucket === "running") {
    return (
      <View
        role="status"
        accessibilityLabel={getStatusBucketLabel(statusBucket, t)}
        style={styles.runningDotAnchor}
        testID="project-status-badge"
      >
        <RunningDot backdrop={backdrop} />
      </View>
    );
  }
  return (
    <View
      role="status"
      accessibilityLabel={getStatusBucketLabel(statusBucket, t)}
      style={[styles.statusBadge, getStatusBadgeBackdropStyle(backdrop)]}
      testID="project-status-badge"
    >
      {content.kind === "alert" ? (
        <ThemedCircleAlert size={STATUS_INDICATOR_ALERT_SIZE} uniProps={needsInputColorMapping} />
      ) : (
        <ProjectStatusDot bucket={content.bucket} />
      )}
    </View>
  );
}

function getStatusBadgeBackdropStyle(backdrop: SidebarSurfaceBackdrop): ViewStyle {
  switch (backdrop) {
    case "surfaceSidebar":
      return styles.statusBadgeOnSidebar;
    case "surfaceSidebarHover":
      return styles.statusBadgeOnSidebarHover;
    case "surfaceSidebarSelected":
      return styles.statusBadgeOnSidebarSelected;
    case "surface2":
      return styles.statusBadgeOnSurface2;
  }
}

function ProjectStatusDot({ bucket }: { bucket: ProjectStatusBadgeDotBucket }) {
  return <View testID="project-status-dot" style={getStatusDotColorStyle(bucket)} />;
}

function ProjectIcon({
  iconDataUri,
  projectViewKey,
}: {
  iconDataUri: string | null;
  projectViewKey: string;
}) {
  return (
    <DensityProjectIconView
      iconDataUri={iconDataUri}
      projectViewKey={projectViewKey}
      uniProps={projectIconProps}
    />
  );
}

// "collapse" means the project is open, so the chevron points down.
function ProjectInlineChevron({ chevron }: { chevron: "expand" | "collapse" | null }) {
  if (chevron === null) {
    return null;
  }
  return (
    <DisclosureRotation expanded={chevron === "collapse"}>
      <ThemedChevronRight size={16} uniProps={foregroundExtraMutedColorMapping} />
    </DisclosureRotation>
  );
}

function getStatusDotColorStyle(bucket: ProjectStatusBadgeDotBucket): ViewStyle {
  if (bucket === "failed") return styles.statusDotFailed;
  if (bucket === "running") return styles.statusDotRunning;
  return styles.statusDotAttention;
}

const styles = StyleSheet.create((theme) => {
  // Dot statuses sit *inside* the shell rather than replacing it, so they carry the same ring
  // the alert does. The geometry is shared here and baked into each colored variant so the
  // style prop stays a single stable object; the colors come from the one bucket-to-color map
  // so this badge can't drift from the status dots everywhere else.
  const statusDot = (bucket: ProjectStatusBadgeDotBucket) =>
    ({
      width: STATUS_INDICATOR_FILLED_DOT_SIZE,
      height: STATUS_INDICATOR_FILLED_DOT_SIZE,
      borderRadius: theme.borderRadius.full,
      backgroundColor: getStatusDotColor({ theme, bucket }) ?? undefined,
    }) as const;

  return {
    // The slot is as tall as the title's line box, not as tall as the icon, and centers the
    // icon inside it. Rows lay their leading visual out with alignItems:flex-start, so a slot
    // only as tall as the icon puts it above the title and the kebab — which is why the
    // workspace status indicator is as tall as `LEADING_SLOT_HEIGHT`.
    projectChevronSlot: {
      width: densityIconBox("md"),
      height: LEADING_SLOT_HEIGHT,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    projectLeadingVisualSlot: {
      width: densityIconBox("md"),
      height: LEADING_SLOT_HEIGHT,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    // Anchors the corner badge to the icon rather than to the taller slot.
    projectIconBox: {
      position: "relative",
      width: densityIconBox("md"),
      height: densityIconBox("md"),
    },
    // The shell the alert and dot statuses share. It straddles the icon's bottom-right corner
    // (half in, half out) so the lettered project box stays readable. The shell is a knockout:
    // it is filled with the colour of the row behind it, which is what makes the ring around the
    // dot read as a gap in the icon rather than as a white halo drawn on top of it.
    statusBadge: {
      position: "absolute",
      right: STATUS_BADGE_OFFSET,
      bottom: STATUS_BADGE_OFFSET,
      width: STATUS_BADGE_SIZE,
      height: STATUS_BADGE_SIZE,
      borderRadius: theme.borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    // The running dot positions itself on the icon's corner; this only fills the icon box.
    runningDotAnchor: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    statusBadgeOnSidebar: { backgroundColor: theme.colors.surfaceSidebar },
    statusBadgeOnSidebarHover: { backgroundColor: theme.colors.surfaceSidebarHover },
    statusBadgeOnSidebarSelected: { backgroundColor: theme.colors.surfaceSidebarSelected },
    statusBadgeOnSurface2: { backgroundColor: theme.colors.surface2 },
    statusDotRunning: statusDot("running"),
    statusDotFailed: statusDot("failed"),
    statusDotAttention: statusDot("attention"),
  };
});
