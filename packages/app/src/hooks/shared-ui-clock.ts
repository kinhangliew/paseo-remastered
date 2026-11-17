import { useLayoutEffect, useState } from "react";
import { makeMutable, type SharedValue, useSharedValue } from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";
import { useRetainedPanelActive } from "@/components/retained-panel";

/**
 * One UI-thread clock for a family of looping indicators. `read` maps wall-clock time to the
 * family's phase, so an instance that mounts mid-flight is already in step with the rest. The
 * clock runs only while at least one active instance listens, and a hidden retained panel's
 * instances do not listen (docs/coding-standards.md, infinite animations are subscriptions).
 */
export function createSharedUiClock(read: (nowMs: number) => number): () => SharedValue<number> {
  const shared = makeMutable(read(Date.now()));
  const activeCount = makeMutable(0);
  const running = makeMutable(false);
  let nextListenerId = 1;

  function advance(): void {
    "worklet";
    if (activeCount.value === 0) {
      running.value = false;
      return;
    }
    shared.value = read(Date.now());
    requestAnimationFrame(advance);
  }

  function register(value: SharedValue<number>, registered: SharedValue<boolean>, id: number) {
    "worklet";
    if (registered.value) return;
    registered.value = true;
    value.value = read(Date.now());
    shared.addListener(id, (next) => {
      value.value = next;
    });
    activeCount.value += 1;
    if (!running.value) {
      running.value = true;
      shared.value = read(Date.now());
      requestAnimationFrame(advance);
    }
  }

  function unregister(registered: SharedValue<boolean>, id: number) {
    "worklet";
    if (!registered.value) return;
    registered.value = false;
    shared.removeListener(id);
    activeCount.value -= 1;
  }

  return function useSharedUiClock(): SharedValue<number> {
    const active = useRetainedPanelActive();
    const value = useSharedValue(read(Date.now()));
    const registered = useSharedValue(false);
    const [listenerId] = useState(() => nextListenerId++);

    useLayoutEffect(() => {
      if (!active) return;
      scheduleOnUI(register, value, registered, listenerId);
      return () => {
        scheduleOnUI(unregister, registered, listenerId);
      };
    }, [active, listenerId, registered, value]);

    return value;
  };
}
