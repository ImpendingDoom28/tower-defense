export const MIN_GRID_SIZE = 5;
export const MAX_GRID_SIZE = 64;

export const clampGridSize = (value: number): number =>
  Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, value));
