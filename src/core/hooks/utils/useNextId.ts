import { useMemo } from "react";

export const createIdCounter = () => {
  let nextId = 1;

  const getNextId = (reset?: boolean): number => {
    if (reset || nextId === Number.MAX_SAFE_INTEGER) nextId = 1;
    return nextId++;
  };

  const ensureAtLeast = (minId: number): void => {
    if (!Number.isFinite(minId)) return;
    nextId = Math.max(nextId, Math.max(1, Math.ceil(minId)));
  };

  return {
    getNextId,
    ensureAtLeast,
  };
};

export const useNextId = () => useMemo(createIdCounter, []);
