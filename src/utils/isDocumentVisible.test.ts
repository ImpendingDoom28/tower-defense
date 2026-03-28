/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";

import { getIsDocumentVisible } from "./isDocumentVisible";

describe("getIsDocumentVisible", () => {
  it("returns true when visibilityState is visible", () => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    expect(getIsDocumentVisible()).toBe(true);
  });

  it("returns false when visibilityState is hidden", () => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    expect(getIsDocumentVisible()).toBe(false);
  });
});
