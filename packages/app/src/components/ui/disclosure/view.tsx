import { useCallback, useEffect, useMemo, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Keyframe,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  DISCLOSURE_EASE_OUT,
  DISCLOSURE_MOTION,
  itemEnterDelay,
} from "@/components/ui/disclosure/motion";
import {
  DisclosureItemContext,
  useDisclosureItemMotion,
  useDisclosurePresence,
} from "@/components/ui/disclosure/presence";
import type {
  DisclosureItemProps,
  DisclosureProps,
  DisclosureRotationProps,
} from "@/components/ui/disclosure/types";

const EASE_OUT = Easing.bezier(...DISCLOSURE_EASE_OUT);

// Animated views take only plain React Native styles: a Unistyles style on a Reanimated view
// crashes on theme change (docs/unistyles.md).
const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  measuring: { position: "absolute", top: 0, right: 0, left: 0 },
  rotation: { alignItems: "center", justifyContent: "center" },
});

/**
 * A region that grows to its content's height when expanded and shrinks back when collapsed. The
 * content is measured once it mounts; at rest the region lays out normally.
 */
export function Disclosure({ expanded, children, testID }: DisclosureProps) {
  const presence = useDisclosurePresence(expanded);
  if (!presence.mounted) return null;
  return (
    <DisclosureBody enterOnMount={presence.enterOnMount} closing={presence.closing} testID={testID}>
      {children}
    </DisclosureBody>
  );
}

interface DisclosureBodyProps {
  enterOnMount: boolean;
  closing: boolean;
  testID?: string;
  children: DisclosureProps["children"];
}

function DisclosureBody({ enterOnMount, closing, testID, children }: DisclosureBodyProps) {
  const reducedMotion = useReducedMotion();
  const animatesHeight = !reducedMotion;
  const progress = useSharedValue(enterOnMount ? 0 : 1);
  const contentHeight = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [settled, setSettled] = useState(!enterOnMount || !animatesHeight);
  const [measured, setMeasured] = useState(false);
  if (settled && closing && animatesHeight) setSettled(false);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      // A hidden retained panel reports zero; keep the last real height.
      if (height <= 0) return;
      contentHeight.value = height;
      setMeasured(true);
    },
    [contentHeight],
  );

  useEffect(() => {
    if (closing) {
      opacity.value = withTiming(0, { duration: DISCLOSURE_MOTION.collapseFadeMs });
      if (animatesHeight) {
        progress.value = withTiming(0, { duration: DISCLOSURE_MOTION.expandMs, easing: EASE_OUT });
      }
      return;
    }
    if (!animatesHeight) {
      opacity.value = 1;
      return;
    }
    if (!measured) return;
    opacity.value = 1;
    progress.value = withTiming(1, { duration: DISCLOSURE_MOTION.expandMs, easing: EASE_OUT });
    const timer = setTimeout(() => setSettled(true), DISCLOSURE_MOTION.expandMs);
    return () => clearTimeout(timer);
  }, [animatesHeight, closing, measured, opacity, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (settled) return { opacity: opacity.value };
    return { height: progress.value * contentHeight.value, opacity: opacity.value };
  }, [settled]);

  const itemMotion = useMemo(() => ({ enterOnMount, closing }), [enterOnMount, closing]);

  return (
    <Animated.View style={[settled ? null : styles.clip, animatedStyle]} testID={testID}>
      <View style={settled ? null : styles.measuring} onLayout={handleLayout}>
        <DisclosureItemContext value={itemMotion}>{children}</DisclosureItemContext>
      </View>
    </Animated.View>
  );
}

function itemEntering(delay: number, moves: boolean) {
  const offset = moves ? DISCLOSURE_MOTION.itemEnterOffset : 0;
  return new Keyframe({
    0: { opacity: 0, transform: [{ translateY: offset }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
  })
    .duration(DISCLOSURE_MOTION.itemEnterMs)
    .delay(delay);
}

/** One revealed row: it fades and drops into place after the rows above it. */
export function DisclosureItem({ index, children }: DisclosureItemProps) {
  const { enterOnMount } = useDisclosureItemMotion();
  const reducedMotion = useReducedMotion();
  // Captured at mount: a row added later to an open region does not replay the entrance.
  const [entering] = useState(() =>
    enterOnMount
      ? itemEntering(reducedMotion ? 0 : itemEnterDelay(index), !reducedMotion)
      : undefined,
  );
  return <Animated.View entering={entering}>{children}</Animated.View>;
}

/** Turns a right-pointing chevron down when expanded. */
export function DisclosureRotation({ expanded, children }: DisclosureRotationProps) {
  const reducedMotion = useReducedMotion();
  const angle = useSharedValue(expanded ? 90 : 0);
  useEffect(() => {
    const target = expanded ? 90 : 0;
    angle.value = reducedMotion
      ? target
      : withTiming(target, { duration: DISCLOSURE_MOTION.chevronMs, easing: EASE_OUT });
  }, [angle, expanded, reducedMotion]);
  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));
  return <Animated.View style={[styles.rotation, rotationStyle]}>{children}</Animated.View>;
}
