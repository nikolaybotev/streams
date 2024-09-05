import { makePipe } from "../util/pipe";

export interface IntervalScheduler<T = unknown> {
  schedule(interval: number, listener: () => unknown): T;
  cancel(scheduled: T);
}

export const defaultScheduler = {
  schedule(interval: number, listener: () => unknown) {
    return setInterval(listener, interval);
  },
  cancel(scheduled) {
    clearInterval(scheduled as number);
  },
} as IntervalScheduler;

export function streamInterval(
  periodMillis: number,
  scheduler: IntervalScheduler = defaultScheduler,
): AsyncIterableIterator<number> {
  const { next, ...pipe } = makePipe<number>();

  let n = 0;
  const timer = scheduler.schedule(periodMillis, () => {
    pipe.put(n++);
  });

  function close(): Promise<IteratorResult<number>> {
    pipe.close(true);
    scheduler.cancel(timer);
    return Promise.resolve({ done: true, value: undefined });
  }

  // Wrap the interval Iterator in an AsyncGenerator in order to ensure that
  // AsyncIterator Helpers are available where implemented by the runtime.
  const intervalIterator = { next, return: close, throw: close };
  const intervalIterable = { [Symbol.asyncIterator]: () => intervalIterator };
  async function* generateInterval() {
    yield* intervalIterable;
  }

  return generateInterval();
}
