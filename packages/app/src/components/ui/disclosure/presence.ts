import { createContext, useContext, useEffect, useState } from "react";
import { DISCLOSURE_MOTION } from "./motion";

export interface DisclosureItemMotion {
  /** Rows mounting now arrive with the staggered fade. False on first render. */
  enterOnMount: boolean;
  /** The region is collapsing; its rows fade out together. */
  closing: boolean;
}

const STILL: DisclosureItemMotion = { enterOnMount: false, closing: false };

export const DisclosureItemContext = createContext<DisclosureItemMotion>(STILL);

export function useDisclosureItemMotion(): DisclosureItemMotion {
  return useContext(DisclosureItemContext);
}

interface PresenceState {
  expanded: boolean;
  mounted: boolean;
  /** The region has changed since its first render, so changes now animate. */
  changed: boolean;
}

export interface DisclosurePresence extends DisclosureItemMotion {
  /** Children stay mounted while a collapse plays, then unmount. */
  mounted: boolean;
}

/**
 * Whether a region's children are mounted, and how they move. A collapse keeps them mounted for
 * the length of the height animation; the first render never animates.
 */
export function useDisclosurePresence(expanded: boolean): DisclosurePresence {
  const [state, setState] = useState<PresenceState>({
    expanded,
    mounted: expanded,
    changed: false,
  });
  if (state.expanded !== expanded) {
    setState({ expanded, mounted: state.mounted || expanded, changed: true });
  }

  const unmountPending = !state.expanded && state.mounted;
  useEffect(() => {
    if (!unmountPending) return;
    const timer = setTimeout(() => {
      setState((current) => (current.expanded ? current : { ...current, mounted: false }));
    }, DISCLOSURE_MOTION.expandMs);
    return () => clearTimeout(timer);
  }, [unmountPending]);

  return {
    mounted: state.mounted,
    closing: !state.expanded,
    enterOnMount: state.changed && state.expanded,
  };
}
