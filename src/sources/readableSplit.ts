import { Readable, Writable } from "node:stream";
import { makePipe } from "../util/pipe";

export interface Splitter<B, T, R = T> {
  initial(): R;
  split(chunk: B, previous: R): [T[], R];
  last(remainder: R): T | null;
}

export function readableSplit<T, R = T>(
  readable: Readable,
  by: Splitter<Buffer, T, R>,
  encoding?: BufferEncoding,
): AsyncIterableIterator<T> {
  const { next, ...pipe } = makePipe<T>();

  let remainder = by.initial();

  const writable = new Writable({
    defaultEncoding: encoding,
    write(chunk: Buffer, _encoding, callback) {
      const [items, nextRemainder] = by.split(chunk, remainder);

      const puts = items.map(pipe.put);

      remainder = nextRemainder;

      // Apply back-pressure by awaiting consumption of produced items...
      Promise.all(puts).then(() => callback());
    },
  });

  const endListener = () => {
    const lastItem = by.last(remainder);
    if (lastItem !== null) {
      pipe.put(lastItem);
    }

    // Allow consumers to read any buffered data
    cleanUp();
  };

  // Use pipe instead of on("data") because unpipe() releases the stream,
  // putting the stream in paused mode.
  // See https://nodejs.org/api/stream.html#two-reading-modes
  readable.pipe(writable);
  readable.on("end", endListener);

  function cleanUp() {
    pipe.close();
    readable.unpipe(writable);
    readable.off("end", endListener);
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
