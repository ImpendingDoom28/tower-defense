const BACKGROUND_TICK_INTERVAL_MS = 50;

let intervalId: ReturnType<typeof setInterval> | null = null;

self.addEventListener("message", ({ data }: MessageEvent<"start" | "stop">) => {
  if (data === "start" && intervalId === null) {
    intervalId = setInterval(
      () => self.postMessage("tick"),
      BACKGROUND_TICK_INTERVAL_MS
    );
  }

  if (data === "stop" && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
});
