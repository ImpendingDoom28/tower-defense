import { describe, expect, it } from "vitest";

import {
  beginPauseSegment,
  createPauseClock,
  endPauseSegment,
  getEffectiveGameTime,
} from "./pauseClock";

describe("getEffectiveGameTime + pause clock", () => {
  it("matches raw time when never paused", () => {
    const clock = createPauseClock();
    expect(getEffectiveGameTime(10, clock)).toBe(10);
  });

  it("freezes effective time while paused", () => {
    const clock = createPauseClock();
    beginPauseSegment(clock, 10);
    expect(getEffectiveGameTime(10, clock)).toBe(10);
    expect(getEffectiveGameTime(100, clock)).toBe(10);
  });

  it("excludes completed pause segments from effective time", () => {
    const clock = createPauseClock();
    beginPauseSegment(clock, 10);
    endPauseSegment(clock, 15);
    expect(clock.pauseDurationTotal).toBe(5);
    expect(getEffectiveGameTime(20, clock)).toBe(15);
  });

  it("accumulates multiple pause segments", () => {
    const clock = createPauseClock();
    beginPauseSegment(clock, 0);
    endPauseSegment(clock, 3);
    beginPauseSegment(clock, 10);
    endPauseSegment(clock, 12);
    expect(clock.pauseDurationTotal).toBe(5);
    expect(getEffectiveGameTime(20, clock)).toBe(15);
  });
});
