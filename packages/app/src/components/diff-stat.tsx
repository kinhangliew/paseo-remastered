import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { formatDiffCount } from "@/git/file-header-presentation";
import { CONTROL_HEIGHTS } from "@/components/ui/control-geometry";

interface DiffStatProps {
  additions: number;
  deletions: number;
  testID?: string;
}

export function DiffStat({ additions, deletions, testID }: DiffStatProps) {
  return (
    <View style={styles.row} testID={testID}>
      <Text style={styles.additions}>+{formatDiffCount(additions)}</Text>
      <Text style={styles.deletions}>-{formatDiffCount(deletions)}</Text>
    </View>
  );
}

/** A diff stat in a pill, for a header beside its buttons (`design-handoff/soft-ui.md`). */
export function DiffStatPill({ additions, deletions, testID }: DiffStatProps) {
  return (
    <View style={styles.pill} testID={testID}>
      <DiffStat additions={additions} deletions={deletions} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    height: CONTROL_HEIGHTS.sm,
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface2,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 20,
    gap: 4,
    flexShrink: 0,
  },
  additions: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.statusSuccess,
  },
  deletions: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.statusDanger,
  },
}));
