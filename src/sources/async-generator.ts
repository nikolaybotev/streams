export function makeAsyncGenerator<
  T = unknown,
  TReturn = unknown,
  TNext = undefined,
>(
  start: () => void,
  next: (...args: [] | [TNext]) => Promise<IteratorResult<T, TReturn>>,
  stop: () => TReturn,
): AsyncGenerator<T, TReturn, TNext> {
  async function doStop(): Promise<IteratorResult<T, TReturn>> {
    const value = stop();
    return { done: true, value };
  }
  const iterator: AsyncIterator<T, TReturn, TNext> = {
    next,
    return: doStop,
    throw: doStop,
  };
  const iterable = { [Symbol.asyncIterator]: () => iterator };
  async function* generator(): AsyncGenerator<T, TReturn, TNext> {
    start();

    return yield* iterable;
  }

  return generator();
}
