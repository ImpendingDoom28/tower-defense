import { describe, expect, it } from "vitest";

import {
  getShouldStopMovement,
  shouldPauseForTabHidden,
} from "./getShouldStopMovement";

describe("getShouldStopMovement", () => {
  it("is true when paused", () => {
    expect(getShouldStopMovement("paused", false, true, true)).toBe(true);
  });

  it("is false when playing and page visible", () => {
    expect(getShouldStopMovement("playing", false, true, true)).toBe(false);
  });

  it("is true when page not visible and pause on tab hidden enabled", () => {
    expect(getShouldStopMovement("playing", false, false, true)).toBe(true);
  });

  it("is false when page not visible and pause on tab hidden disabled", () => {
    expect(getShouldStopMovement("playing", false, false, false)).toBe(false);
  });

  it("is true when controls are disabled", () => {
    expect(getShouldStopMovement("playing", true, true, false)).toBe(true);
  });
});

describe("shouldPauseForTabHidden", () => {
  it("is true when tab hidden and setting enabled", () => {
    expect(shouldPauseForTabHidden(false, true)).toBe(true);
  });

  it("is false when tab hidden but setting disabled", () => {
    expect(shouldPauseForTabHidden(false, false)).toBe(false);
  });

  it("is false when tab visible", () => {
    expect(shouldPauseForTabHidden(true, true)).toBe(false);
  });
});
