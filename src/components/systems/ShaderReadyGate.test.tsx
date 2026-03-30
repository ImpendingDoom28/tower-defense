import ReactThreeTestRenderer from "@react-three/test-renderer";
import { describe, expect, it, vi } from "vitest";

import { ShaderReadyGate } from "./ShaderReadyGate";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("ShaderReadyGate", () => {
  it("invokes onShadersReady after shader precompile completes", async () => {
    const onShadersReady = vi.fn();

    const renderer = await ReactThreeTestRenderer.create(
      <ShaderReadyGate onShadersReady={onShadersReady} />
    );

    try {
      await ReactThreeTestRenderer.act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });
      });

      expect(onShadersReady).toHaveBeenCalledTimes(1);
    } finally {
      renderer.unmount();
    }
  });
});
