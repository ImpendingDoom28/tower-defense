import { describe, expect, it } from "vitest";

import { MAX_GRID_SIZE, MIN_GRID_SIZE, clampGridSize } from "./gridSizeLimits";

describe("clampGridSize", () => {
  it("clamps non-finite values to max", () => {
    expect(clampGridSize(Infinity)).toBe(MAX_GRID_SIZE);
    expect(clampGridSize(Number("1e309"))).toBe(MAX_GRID_SIZE);
  });

  it("clamps values to the supported range", () => {
    expect(clampGridSize(0)).toBe(MIN_GRID_SIZE);
    expect(clampGridSize(64)).toBe(MAX_GRID_SIZE);
    expect(clampGridSize(65)).toBe(MAX_GRID_SIZE);
  });

  it("leaves in-range values unchanged", () => {
    expect(clampGridSize(12)).toBe(12);
    expect(clampGridSize(12.5)).toBe(12.5);
  });
});
