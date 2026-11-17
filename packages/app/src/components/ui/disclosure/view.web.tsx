import {
  type CSSProperties,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type TransitionEvent,
} from "react";
import { useReducedMotion } from "react-native-reanimated";
import {
  DISCLOSURE_EASE_OUT_CSS,
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

// Two frames: the first paints the hidden state, the second starts the transition from it.
function useRevealAfterPaint(startHidden: boolean): boolean {
  const [revealed, setRevealed] = useState(!startHidden);
  useLayoutEffect(() => {
    if (revealed) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setRevealed(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [revealed]);
  return revealed;
}

const COLUMN: CSSProperties = { display: "flex", flexDirection: "column", minWidth: 0 };

/**
 * A region that grows to its content's height when expanded and shrinks back when collapsed. The
 * height runs through `grid-template-rows: 0fr → 1fr`, so nothing is measured.
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
  const revealed = useRevealAfterPaint(enterOnMount);
  const open = revealed && !closing;
  const [settled, setSettled] = useState(!enterOnMount);
  if (settled && !open) setSettled(false);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && open) setSettled(true);
    },
    [open],
  );

  const gridStyle = useMemo<CSSProperties>(
    () => ({
      display: "grid",
      gridTemplateRows: open ? "1fr" : "0fr",
      transition: reducedMotion
        ? undefined
        : `grid-template-rows ${DISCLOSURE_MOTION.expandMs}ms ${DISCLOSURE_EASE_OUT_CSS}`,
    }),
    [open, reducedMotion],
  );
  // Clip only while moving, so focus rings and the running dot's halo are not cut off at rest.
  const clipStyle = useMemo<CSSProperties>(
    () => ({ ...COLUMN, minHeight: 0, overflow: settled || reducedMotion ? undefined : "hidden" }),
    [settled, reducedMotion],
  );
  const itemMotion = useMemo(() => ({ enterOnMount, closing }), [enterOnMount, closing]);

  return (
    <div style={gridStyle} onTransitionEnd={handleTransitionEnd} data-testid={testID}>
      <div style={clipStyle}>
        <DisclosureItemContext value={itemMotion}>{children}</DisclosureItemContext>
      </div>
    </div>
  );
}

/** One revealed row: it fades and drops into place after the rows above it. */
export function DisclosureItem({ index, children }: DisclosureItemProps) {
  const { enterOnMount, closing } = useDisclosureItemMotion();
  const reducedMotion = useReducedMotion();
  // Captured at mount: a row added later to an open region does not replay the entrance.
  const [animatesIn] = useState(enterOnMount);
  const entered = useRevealAfterPaint(animatesIn);

  const style = useMemo<CSSProperties>(() => {
    if (closing) {
      return {
        ...COLUMN,
        opacity: 0,
        transition: `opacity ${DISCLOSURE_MOTION.collapseFadeMs}ms ease`,
      };
    }
    if (!animatesIn) return COLUMN;
    if (!entered) {
      return reducedMotion
        ? { ...COLUMN, opacity: 0 }
        : {
            ...COLUMN,
            opacity: 0,
            transform: `translateY(${DISCLOSURE_MOTION.itemEnterOffset}px)`,
            filter: `blur(${DISCLOSURE_MOTION.itemEnterBlur}px)`,
          };
    }
    const delay = reducedMotion ? 0 : itemEnterDelay(index);
    const timing = `${DISCLOSURE_MOTION.itemEnterMs}ms ${DISCLOSURE_EASE_OUT_CSS} ${delay}ms`;
    return {
      ...COLUMN,
      opacity: 1,
      transition: reducedMotion
        ? `opacity ${timing}`
        : `opacity ${timing}, transform ${timing}, filter ${timing}`,
    };
  }, [animatesIn, closing, entered, index, reducedMotion]);

  return <div style={style}>{children}</div>;
}

/** Turns a right-pointing chevron down when expanded. */
export function DisclosureRotation({ expanded, children }: DisclosureRotationProps) {
  const reducedMotion = useReducedMotion();
  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      transition: reducedMotion
        ? undefined
        : `transform ${DISCLOSURE_MOTION.chevronMs}ms ${DISCLOSURE_EASE_OUT_CSS}`,
    }),
    [expanded, reducedMotion],
  );
  return <div style={style}>{children}</div>;
}
