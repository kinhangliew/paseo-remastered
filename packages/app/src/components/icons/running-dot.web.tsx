import { useCallback, useLayoutEffect, useRef } from "react";
import { View, type View as NativeView } from "react-native";
import { type RunningDotProps, runningDotRingStyle, runningDotStyles } from "./running-dot-styles";

const BREATH_KEYFRAMES: Keyframe[] = [
  { opacity: 0.55, transform: "scale(1)" },
  { opacity: 0, transform: "scale(2.4)" },
];
const BREATH_TIMING: KeyframeAnimationOptions = {
  duration: 1800,
  easing: "ease-out",
  iterations: Number.POSITIVE_INFINITY,
};
// One document-timeline epoch, so every dot in the sidebar breathes in phase.
const BREATH_TIMELINE_START_MS = 0;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Web running dot: a green dot whose halo breathes on a 1.8s loop. */
export function RunningDot({ backdrop }: RunningDotProps) {
  const haloElement = useRef<HTMLElement | null>(null);
  const setHalo = useCallback((instance: NativeView | null) => {
    haloElement.current = instance instanceof HTMLElement ? instance : null;
  }, []);

  useLayoutEffect(() => {
    const element = haloElement.current;
    if (!element || prefersReducedMotion()) return;
    const animation = element.animate(BREATH_KEYFRAMES, BREATH_TIMING);
    animation.startTime = BREATH_TIMELINE_START_MS;
    return () => animation.cancel();
  }, []);

  return (
    <View style={runningDotStyles.anchor} testID="running-dot">
      <View ref={setHalo} pointerEvents="none" style={runningDotStyles.halo} />
      <View style={[runningDotStyles.dot, runningDotRingStyle(backdrop)]} />
    </View>
  );
}
