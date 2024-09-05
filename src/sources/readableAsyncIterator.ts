import { Readable } from "node:stream";
import { makePipe } from "../util/pipe";

export interface Splitter<B, T, R> {
  initial(): R;
  split(chunk: B, previous: R): [T[], R];
  last(remainder: R): T | null;
}

export function readableAsyncIterator<T, R>(
  readable: Readable,
  by: Splitter<Buffer | string, T, R>,
): AsyncIterableIterator<T> {
  const { next, ...pipe } = makePipe<T>();

  let remainder = by.initial();

  const dataListener = (chunk: Buffer | string) => {
    const [items, nextRemainder] = by.split(chunk, remainder);

    items.forEach(pipe.put);

    remainder = nextRemainder;
  };

  const endListener = () => {
    const lastItem = by.last(remainder);
    if (lastItem !== null) {
      pipe.put(lastItem);
    }

    // Allow consumers to read any buffered data
    cleanUp();
  };

  readable.on("data", dataListener);
  readable.on("end", endListener);

  function cleanUp() {
    pipe.close();
    readable.removeListener("data", dataListener);
    readable.removeListener("end", endListener);
  }

  function close(): Promise<IteratorResult<T>> {
    cleanUp();
    return Promise.resolve({ done: true, value: undefined });
  }

  // Wrap the readable Iterator in an AsyncGenerator in order to ensure that
  // AsyncIterator Helpers are available where implemented by the runtime.
  const iterator = { next, return: close, throw: close };
  const iterable = { [Symbol.asyncIterator]: () => iterator };
  async function* generator() {
    yield* iterable;
  }

  return generator();
}
