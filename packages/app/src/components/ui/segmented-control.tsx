import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet as RNStyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type PressableStateCallbackType,
} from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { DISCLOSURE_EASE_OUT } from "@/components/ui/disclosure/motion";
import {
  createControlGeometry,
  controlIconSize,
  type ControlSize,
} from "@/components/ui/control-geometry";
import { useContainedControlSize } from "@/components/ui/control-size";
import type { Theme } from "@/styles/theme";

type SegmentedControlIconRenderer = (props: { color: string; size: number }) => ReactNode;

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: SegmentedControlIconRenderer;
  disabled?: boolean;
  testID?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  size?: ControlSize;
  hideLabels?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface SegmentIconProps {
  icon: SegmentedControlIconRenderer;
  iconSize: number;
  iconColor: string;
}

function SegmentIcon({ icon, iconSize, iconColor }: SegmentIconProps) {
  return <View style={styles.iconContainer}>{icon({ color: iconColor, size: iconSize })}</View>;
}

const ThemedSegmentIcon = withUnistyles(SegmentIcon);

const selectedIconMapping = (theme: Theme) => ({ iconColor: theme.colors.foreground });
const mutedIconMapping = (theme: Theme) => ({ iconColor: theme.colors.foregroundMuted });

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size: sizeProp,
  hideLabels = false,
  style,
  testID,
}: SegmentedControlProps<T>) {
  const containedSize = useContainedControlSize();
  const size = sizeProp ?? containedSize ?? "md";
  const sizeStyles = {
    sm: { container: styles.containerSm, segment: styles.segmentSm, label: styles.labelSm },
    md: { container: styles.containerMd, segment: styles.segmentMd, label: styles.labelMd },
  }[size];
  const containerSizeStyle = sizeStyles.container;
  const segmentSizeStyle = sizeStyles.segment;
  const labelSizeStyle = sizeStyles.label;
  const iconSize = controlIconSize[size];

  const containerStyle = useMemo(
    () => [styles.container, containerSizeStyle, style],
    [containerSizeStyle, style],
  );
  const [frames, setFrames] = useState<Partial<Record<T, SegmentFrame>>>({});
  const handleSegmentLayout = useCallback((segmentValue: T, frame: SegmentFrame) => {
    setFrames((current) => {
      const previous = current[segmentValue];
      if (previous && previous.x === frame.x && previous.width === frame.width) return current;
      return { ...current, [segmentValue]: frame };
    });
  }, []);
  const selectedFrame = frames[value] ?? null;

  return (
    <View style={containerStyle} testID={testID}>
      {selectedFrame ? <SegmentIndicator frame={selectedFrame} /> : null}
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <SegmentItem
            key={option.value}
            option={option}
            isSelected={isSelected}
            showsOwnFill={isSelected && selectedFrame === null}
            iconSize={iconSize}
            hideLabels={hideLabels}
            segmentSizeStyle={segmentSizeStyle}
            labelSizeStyle={labelSizeStyle}
            currentValue={value}
            onValueChange={onValueChange}
            onFrame={handleSegmentLayout}
          />
        );
      })}
    </View>
  );
}

interface SegmentFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

const INDICATOR_SLIDE_MS = 320;
const INDICATOR_EASING = Easing.bezier(...DISCLOSURE_EASE_OUT);

// Positioning only: a Unistyles style on the Reanimated view crashes on theme change
// (docs/unistyles.md), so the pill's color sits on a plain child.
const indicatorFrameStyles = RNStyleSheet.create({
  frame: { position: "absolute", top: 0, left: 0 },
});

/** The white pill under the selected segment. It slides to a new segment over 320ms. */
function SegmentIndicator({ frame }: { frame: SegmentFrame }) {
  const reducedMotion = useReducedMotion();
  const x = useSharedValue(frame.x);
  const width = useSharedValue(frame.width);
  useEffect(() => {
    if (reducedMotion) {
      x.value = frame.x;
      width.value = frame.width;
      return;
    }
    const timing = { duration: INDICATOR_SLIDE_MS, easing: INDICATOR_EASING };
    x.value = withTiming(frame.x, timing);
    width.value = withTiming(frame.width, timing);
  }, [frame.x, frame.width, reducedMotion, width, x]);
  const slideStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ translateX: x.value }],
  }));
  const heightStyle = useMemo(
    () => ({ top: frame.y, height: frame.height }),
    [frame.y, frame.height],
  );
  return (
    <Animated.View
      pointerEvents="none"
      style={[indicatorFrameStyles.frame, heightStyle, slideStyle]}
    >
      <View style={styles.indicator} />
    </Animated.View>
  );
}

function SegmentItem<T extends string>({
  option,
  isSelected,
  showsOwnFill,
  iconSize,
  hideLabels,
  segmentSizeStyle,
  labelSizeStyle,
  currentValue,
  onValueChange,
  onFrame,
}: {
  option: SegmentedControlOption<T>;
  isSelected: boolean;
  /** Paints the selected fill itself until the sliding indicator has measured this segment. */
  showsOwnFill: boolean;
  iconSize: number;
  hideLabels: boolean;
  segmentSizeStyle: StyleProp<ViewStyle>;
  labelSizeStyle: StyleProp<TextStyle>;
  currentValue: T;
  onValueChange: (value: T) => void;
  onFrame: (value: T, frame: SegmentFrame) => void;
}) {
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      if (width > 0) onFrame(option.value, { x, y, width, height });
    },
    [onFrame, option.value],
  );
  const labelStyle = useMemo(
    () => [styles.label, labelSizeStyle, isSelected && styles.labelSelected],
    [labelSizeStyle, isSelected],
  );
  const handlePress = useCallback(() => {
    if (!option.disabled && option.value !== currentValue) {
      onValueChange(option.value);
    }
  }, [option.disabled, option.value, currentValue, onValueChange]);
  const pressableStyle = useCallback(
    ({ hovered, pressed }: PressableStateCallbackType & { hovered?: boolean }) => [
      styles.segment,
      segmentSizeStyle,
      showsOwnFill && styles.segmentSelected,
      Boolean(hovered) && !isSelected && styles.segmentHover,
      pressed && !isSelected && styles.segmentPressed,
      option.disabled && styles.segmentDisabled,
    ],
    [isSelected, option.disabled, segmentSizeStyle, showsOwnFill],
  );
  const accessibilityState = useMemo(
    () => ({ selected: isSelected, disabled: option.disabled }),
    [isSelected, option.disabled],
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      aria-selected={isSelected}
      disabled={option.disabled}
      testID={option.testID}
      onPress={handlePress}
      onLayout={handleLayout}
      style={pressableStyle}
    >
      {option.icon ? (
        <ThemedSegmentIcon
          icon={option.icon}
          iconSize={iconSize}
          uniProps={isSelected ? selectedIconMapping : mutedIconMapping}
        />
      ) : null}
      {hideLabels ? null : (
        <Text style={labelStyle} numberOfLines={1}>
          {option.label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => {
  const geometry = createControlGeometry(theme);

  return {
    // Soft UI: a gray track with a white pill sliding under the selected segment
    // (`design-handoff/soft-ui.md` §4).
    container: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface2,
      borderRadius: theme.borderRadius.full,
      gap: theme.spacing[1],
    },
    indicator: {
      flex: 1,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surfacePill,
      ...theme.shadow.pill,
    },
    containerSm: {
      ...geometry.segmentedContainerSm,
    },
    containerMd: {
      ...geometry.segmentedContainerMd,
    },
    segment: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      gap: theme.spacing[1],
    },
    segmentSm: {
      ...geometry.segmentedSegmentSm,
    },
    segmentMd: {
      ...geometry.segmentedSegmentMd,
    },
    segmentSelected: {
      backgroundColor: theme.colors.surfacePill,
    },
    segmentHover: {
      backgroundColor: theme.colors.surface3,
    },
    segmentPressed: {
      backgroundColor: theme.colors.surface3,
    },
    segmentDisabled: {
      opacity: theme.opacity[50],
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      color: theme.colors.foregroundMuted,
      fontWeight: theme.fontWeight.normal,
    },
    labelSm: {
      ...geometry.segmentedLabelSm,
    },
    labelMd: {
      ...geometry.segmentedLabelMd,
    },
    labelSelected: {
      color: theme.colors.foreground,
    },
  };
});
