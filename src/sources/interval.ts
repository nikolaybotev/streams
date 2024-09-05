import { makePipe } from "../util/pipe";
import { makeAsyncGenerator } from "./asyncGenerator";

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
  const { next, ...pipe } = makePipe<number>();

  let timer;

  function start() {
    let n = 0;
    timer = scheduler.schedule(periodMillis, () => {
      pipe.put({ value: n++ });
    });
  }

  function stop() {
    pipe.close();
    scheduler.cancel(timer);
  }

  return makeAsyncGenerator(start, next, stop);
}
