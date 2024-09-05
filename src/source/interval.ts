import { makePipe } from "../util/pipe";

export function streamInterval(
  periodMillis: number,
): AsyncIterableIterator<number> {
  const { next, ...pipe } = makePipe<number>();

  let n = 0;
  const timer = setInterval(() => {
    pipe.put(n++);
  }, periodMillis);

  function close(): Promise<IteratorResult<number>> {
    pipe.close(true);
    clearInterval(timer);
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
