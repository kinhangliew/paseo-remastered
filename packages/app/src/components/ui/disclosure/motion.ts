// Motion values for expand and collapse (`design-handoff/soft-ui.md` §5). One table, so the
// sidebar, the file tree and every chevron move on the same curve and clock.
export const DISCLOSURE_MOTION = {
  expandMs: 340,
  chevronMs: 280,
  itemEnterMs: 300,
  itemStaggerMs: 40,
  itemFirstDelayMs: 60,
  // Past this many rows the delay stops growing, so a long list does not drag.
  itemStaggerCap: 8,
  itemEnterOffset: -6,
  itemEnterBlur: 3,
  collapseFadeMs: 180,
} as const;

export const DISCLOSURE_EASE_OUT = [0.2, 0.8, 0.2, 1] as const;
export const DISCLOSURE_EASE_OUT_CSS = "cubic-bezier(.2,.8,.2,1)";

/** How long the `index`th revealed row waits before it fades in. */
export function itemEnterDelay(index: number): number {
  return (
    DISCLOSURE_MOTION.itemFirstDelayMs +
    Math.min(index, DISCLOSURE_MOTION.itemStaggerCap) * DISCLOSURE_MOTION.itemStaggerMs
  );
}
