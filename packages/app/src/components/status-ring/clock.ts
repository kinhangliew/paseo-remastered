import { getStatusRingRotation } from "@/components/status-ring/geometry";
import { createSharedUiClock } from "@/hooks/shared-ui-clock";

/** Every native ring turns on one UI-thread clock, so a ring that mounts mid-flight is in phase. */
export const useStatusRingRotation = createSharedUiClock(getStatusRingRotation);
