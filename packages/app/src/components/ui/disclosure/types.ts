import type { ReactNode } from "react";

export interface DisclosureProps {
  expanded: boolean;
  children: ReactNode;
  testID?: string;
}

export interface DisclosureItemProps {
  /** Position among the revealed rows, for the stagger. */
  index: number;
  children: ReactNode;
}

export interface DisclosureRotationProps {
  /** Points right when false, down when true. */
  expanded: boolean;
  children: ReactNode;
}
