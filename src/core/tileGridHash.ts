export const hashGrid2D = (gridX: number, gridZ: number): number => {
  let h = (gridX * 374761393 + gridZ * 668265263) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return h / 4294967296;
};
