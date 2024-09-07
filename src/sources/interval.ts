import { EventHandler, fromEventPattern } from "./event";

export interface IntervalScheduler<T = unknown> {
  schedule(interval: number, listener: () => unknown): T;
  cancel(scheduled: T): void;
}

export const defaultScheduler = {
  schedule(interval: number, listener: () => unknown) {
    return setInterval(listener, interval);
  },
  cancel(scheduled) {
    clearInterval(scheduled as number);
  },
} as IntervalScheduler;

export function iteratorInterval(
  periodMillis: number,
  scheduler: IntervalScheduler = defaultScheduler,
): AsyncGenerator<number> {
  let timer: unknown;

  function startTimer(handler: EventHandler<number>) {
    let n = 0;
    timer = scheduler.schedule(periodMillis, () => {
      handler(n++);
    });
  }

  function stopTimer() {
    scheduler.cancel(timer);
  }

  return fromEventPattern(startTimer, stopTimer);
}
