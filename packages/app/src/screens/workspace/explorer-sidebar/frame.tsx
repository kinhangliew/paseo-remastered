import { useCallback } from "react";
import { View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import {
  FileExplorerCloseGestureContext,
  useCloseFileExplorerGesture,
} from "@/mobile-panels/gestures";
import { useIsMobilePanelActive } from "@/mobile-panels/provider";
import { MobilePanelOverlay } from "@/mobile-panels/presentation";
import { RetainedPanelActivity } from "@/components/retained-panel";
import { resolveExplorerSidebarWidth } from "@/components/explorer-sidebar-layout";
import { useWorkspaceLayoutStore } from "@/stores/workspace-layout-store";
import { useExplorerGeometry } from "./geometry";
import { FLOATING_PANEL_INSET } from "@/styles/theme";
import type { ExplorerFrameProps } from "./frame-props";

function ExplorerFrameBase({
  children,
  surfaceColor,
  gutterColor,
  presentation,
  isOpen,
  isWorkspaceActive,
  persistenceKey,
  containerWidth,
}: ExplorerFrameProps) {
  const overlay = presentation === "overlay";
  const settledOpen = useIsMobilePanelActive("file-explorer");
  const active = isWorkspaceActive && (overlay ? settledOpen : isOpen);
  const resizeEnabled = isWorkspaceActive && !overlay && isOpen;
  const { gesture, gestureRef } = useCloseFileExplorerGesture(isWorkspaceActive && overlay);
  const storedWidth = useWorkspaceLayoutStore(
    (state) => state.explorerSidebarWidthByWorkspace[persistenceKey],
  );
  const resize = useWorkspaceLayoutStore((state) => state.resizeExplorerSidebar);
  const onResize = useCallback(
    (width: number) => resize(persistenceKey, width),
    [persistenceKey, resize],
  );
  const geometry = useExplorerGeometry({
    width: resolveExplorerSidebarWidth({ requestedWidth: storedWidth, containerWidth }),
    containerWidth,
    overlay,
    resizeEnabled,
    onResize,
  });
  return (
    <RetainedPanelActivity active={active}>
      <FileExplorerCloseGestureContext value={gestureRef}>
        <MobilePanelOverlay
          panel="file-explorer"
          closeGesture={gesture}
          presentation={presentation}
          dockVisible={isOpen}
          frameStyle={geometry.frameStyle}
          panelStyle={[
            { backgroundColor: overlay ? surfaceColor : gutterColor },
            geometry.panelStyle,
          ]}
        >
          <View style={overlay ? styles.content : styles.floatingGutter}>
            {resizeEnabled ? geometry.resizeHandle : null}
            {overlay ? children : <View style={styles.floatingPanel}>{children}</View>}
          </View>
        </MobilePanelOverlay>
      </FileExplorerCloseGestureContext>
    </RetainedPanelActivity>
  );
}
export const ExplorerFrame = withUnistyles(ExplorerFrameBase, (theme) => ({
  surfaceColor: theme.colors.surfaceSidebar,
  gutterColor: theme.colors.surfaceWorkspace,
}));
// Docked, the Explorer floats like the sidebar: the frame keeps its width and paints the page
// around a rounded panel. The resize handle sits in the gap, outside the panel's clip.
const styles = StyleSheet.create((theme) => ({
  content: { flex: 1, minHeight: 0 },
  floatingGutter: { flex: 1, minHeight: 0, padding: FLOATING_PANEL_INSET },
  floatingPanel: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    borderRadius: theme.borderRadius.panel,
    backgroundColor: theme.colors.surfaceSidebar,
  },
}));
