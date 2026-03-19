export type CanvasPoint = {
  x: number;
  y: number;
};

// These points are calibrated for the fixed 1280x720 Playwright viewport.
// Tests try them in order until a tower is successfully placed.
export const gamePlacementPoints: CanvasPoint[] = [
  { x: 720, y: 260 },
  { x: 880, y: 260 },
  { x: 700, y: 360 },
  { x: 860, y: 520 },
  { x: 560, y: 560 },
];
