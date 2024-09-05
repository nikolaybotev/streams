export function makeAsyncGenerator<T = unknown>(
  start: () => void,
  next: () => Promise<IteratorResult<T>>,
  stop: () => void,
): AsyncGenerator<T, undefined, unknown> {
  async function doStop(): Promise<IteratorResult<T, undefined>> {
    stop();
    return { done: true, value: undefined };
  }
  const iterator = { next, return: doStop, throw: doStop };
  const iterable = { [Symbol.asyncIterator]: () => iterator };
  async function* generator(): AsyncGenerator<T, undefined, unknown> {
    start();

    yield* iterable;
  }

  return generator();
}
