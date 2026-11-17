import { describe, expect, it } from "vitest";
import { DISCLOSURE_MOTION, itemEnterDelay } from "./motion";

describe("itemEnterDelay", () => {
  it("starts the first row after 60ms and steps 40ms per row", () => {
    expect(itemEnterDelay(0)).toBe(60);
    expect(itemEnterDelay(1)).toBe(100);
    expect(itemEnterDelay(3)).toBe(180);
  });

  it("stops growing after the cap so a long list does not drag", () => {
    const capped = itemEnterDelay(DISCLOSURE_MOTION.itemStaggerCap);
    expect(itemEnterDelay(DISCLOSURE_MOTION.itemStaggerCap + 20)).toBe(capped);
  });
});
