export type PauseClock = {
  pauseDurationTotal: number;
  pauseSegmentStart: number | null;
};

export const createPauseClock = (): PauseClock => ({
  pauseDurationTotal: 0,
  pauseSegmentStart: null,
});

export const beginPauseSegment = (clock: PauseClock, now: number): void => {
  clock.pauseSegmentStart = now;
};

export const endPauseSegment = (clock: PauseClock, now: number): void => {
  if (clock.pauseSegmentStart === null) return;

  clock.pauseDurationTotal += now - clock.pauseSegmentStart;
  clock.pauseSegmentStart = null;
};

export const getEffectiveGameTime = (
  now: number,
  clock: PauseClock
): number => {
  if (clock.pauseSegmentStart !== null) {
    const currentPauseDuration = now - clock.pauseSegmentStart;
    return now - clock.pauseDurationTotal - currentPauseDuration;
  }
  return now - clock.pauseDurationTotal;
};
