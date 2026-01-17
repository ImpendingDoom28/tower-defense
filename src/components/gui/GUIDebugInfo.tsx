import { FC } from "react";

import { debugSelector, useGameStore } from "../../core/stores/useGameStore";
import { GUIWrapper } from "./GUIWrapper";

type GUIDebugInfoProps = {
  entity: Record<string, unknown>;
  offsetY?: number;
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return `[${value.map(formatValue).join(", ")}]`;
    }
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    // Round to 2 decimal places for readability
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }
  return String(value);
};

export const GUIDebugInfo: FC<GUIDebugInfoProps> = ({
  entity,
  offsetY = 0.5,
}) => {
  const debug = useGameStore(debugSelector);

  if (!debug) return null;

  return (
    <GUIWrapper position={[0, offsetY, 0]}>
      <div className="px-2 py-1 font-mono text-xs text-white border rounded bg-black/50 border-white/20 whitespace-nowrap">
        {Object.entries(entity)
          .filter(([key]) => !key.startsWith("_")) // Filter out private/internal properties
          .map(([key, value]) => (
            <div key={key} className="leading-tight">
              <span className="text-gray-300">{key}:</span>{" "}
              <span className="text-white">{formatValue(value)}</span>
            </div>
          ))}
      </div>
    </GUIWrapper>
  );
};
