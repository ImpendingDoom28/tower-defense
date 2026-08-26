import { describe, expect, it } from "vitest";

import { createIdCounter } from "./useNextId";

describe("createIdCounter", () => {
  it("seeds the next ID above configured entities", () => {
    const { ensureAtLeast, getNextId } = createIdCounter();

    ensureAtLeast(6);

    expect(getNextId()).toBe(6);
  });

  it("never moves the counter backward", () => {
    const { ensureAtLeast, getNextId } = createIdCounter();

    expect(getNextId()).toBe(1);
    ensureAtLeast(1);

    expect(getNextId()).toBe(2);
  });
});
