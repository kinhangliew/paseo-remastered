import { useCallback, useRef, useState } from "react";
import type {
  GestureResponderEvent,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { PressHighlightProps } from "./press-highlight.types";

// A pressed row sinks slightly under the finger or pointer (soft-UI handoff, `design-handoff/soft-ui.md`).
const PRESSED_SCALE = 0.985;

// Before the caller's style, so a caller that sets its own transform, such as a dragged row's lift,
// keeps it.
export const pressedScaleStyle: ViewStyle = { transform: [{ scale: PRESSED_SCALE }] };

type PressFillProps = Pick<
  PressHighlightProps,
  "style" | "highlightStyle" | "onPressIn" | "onPressOut" | "onHighlightChange"
>;

/**
 * Paints `highlightStyle` while pressed, scales the row down, and reports it, for the platforms
 * that show a fill. A press keeps the fill it started with until it ends, so the paint and the
 * report always agree, even when the caller adds or removes `highlightStyle` mid-press.
 */
export function usePressFill({
  style,
  highlightStyle,
  onPressIn,
  onPressOut,
  onHighlightChange,
}: PressFillProps) {
  const [pressFill, setPressFill] = useState<StyleProp<ViewStyle> | null>(null);
  // Pressable can call the press-out handler from the render that started the press.
  const reportedRef = useRef(false);
  const fillStyle = useCallback(
    (state: PressableStateCallbackType) => [
      styles.motion,
      pressFill != null && pressedScaleStyle,
      typeof style === "function" ? style(state) : style,
      pressFill,
    ],
    [style, pressFill],
  );
  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (highlightStyle != null) {
        setPressFill(highlightStyle);
        reportedRef.current = true;
        onHighlightChange?.(true);
      }
      onPressIn?.(event);
    },
    [highlightStyle, onHighlightChange, onPressIn],
  );
  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      setPressFill(null);
      if (reportedRef.current) {
        reportedRef.current = false;
        onHighlightChange?.(false);
      }
      onPressOut?.(event);
    },
    [onHighlightChange, onPressOut],
  );
  return { style: fillStyle, onPressIn: handlePressIn, onPressOut: handlePressOut };
}

const styles = StyleSheet.create({
  // On web the caller's hover and selected fills, and the pressed fill and scale, ease in and back
  // out. Native has no hover, and its pressed fill lands at once.
  motion: {
    _web: {
      transitionProperty: "background-color, transform",
      transitionDuration: "180ms",
      transitionTimingFunction: "ease",
    },
  },
});
