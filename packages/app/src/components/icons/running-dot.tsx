import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion } from "react-native-reanimated";
import { createSharedUiClock } from "@/hooks/shared-ui-clock";
import {
  RUNNING_DOT_SIZE,
  type RunningDotProps,
  runningDotRingStyle,
  runningDotStyles,
} from "./running-dot-styles";

const BREATH_PERIOD_MS = 1800;
const BREATH_MAX_SCALE = 2.4;
const BREATH_START_OPACITY = 0.55;

function getBreathPhase(nowMs: number): number {
  "worklet";
  return (nowMs % BREATH_PERIOD_MS) / BREATH_PERIOD_MS;
}

const useBreathPhase = createSharedUiClock(getBreathPhase);

// Plain styles only on the Reanimated view: a Unistyles style there crashes on theme change
// (docs/unistyles.md). The halo's color sits on a plain child.
const haloStyles = StyleSheet.create({
  frame: { position: "absolute", width: RUNNING_DOT_SIZE, height: RUNNING_DOT_SIZE },
});

/** Native running dot: a green dot whose halo breathes on one shared 1.8s clock. */
export function RunningDot({ backdrop }: RunningDotProps) {
  const reducedMotion = useReducedMotion();
  return (
    <View style={runningDotStyles.anchor} testID="running-dot">
      {reducedMotion ? null : <BreathingHalo />}
      <View style={[runningDotStyles.dot, runningDotRingStyle(backdrop)]} />
    </View>
  );
}

function BreathingHalo() {
  const phase = useBreathPhase();
  const breathStyle = useAnimatedStyle(() => {
    const eased = 1 - (1 - phase.value) ** 3;
    return {
      opacity: BREATH_START_OPACITY * (1 - eased),
      transform: [{ scale: 1 + (BREATH_MAX_SCALE - 1) * eased }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[haloStyles.frame, breathStyle]}>
      <View style={runningDotStyles.halo} />
    </Animated.View>
  );
}
