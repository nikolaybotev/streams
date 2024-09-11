import { EventHandler, fromEventPattern } from "./event";

export interface IntervalScheduler<T = unknown> {
  schedule(interval: number, listener: () => void): T;
  cancel(scheduled: T): void;
}

export const defaultScheduler = {
  schedule(interval: number, listener: () => void) {
    return setInterval(listener, interval);
  },
  cancel(scheduled) {
    clearInterval(scheduled as number);
  },
} as IntervalScheduler;

export function iteratorInterval(
  periodMillis: number,
  scheduler: IntervalScheduler = defaultScheduler,
): AsyncGenerator<number, undefined, unknown> {
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
