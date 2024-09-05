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

      const puts = items.map((value) => pipe.put({ value }));

      remainder = nextRemainder;

      // Apply back-pressure by awaiting consumption of produced items...
      Promise.all(puts).then(() => callback());
    },
  });

  const errorListener = (error) => {
    pipe.put({ error });
    stop();
  };

  const endListener = () => {
    const lastItem = by.last(remainder);
    if (lastItem !== null) {
      pipe.put({ value: lastItem });
    }

    // Allow consumers to read any buffered data
    stop();
  };

  function start() {
    // Use pipe instead of on("data") because unpipe() releases the stream,
    // putting the stream in paused mode.
    // See https://nodejs.org/api/stream.html#two-reading-modes
    readable.pipe(writable);
    readable.on("end", endListener);
    readable.on("close", endListener);
    readable.on("error", errorListener);
  }

  function stop() {
    pipe.close();
    readable.unpipe(writable);
    readable.off("end", endListener);
    readable.off("close", endListener);
    readable.off("error", errorListener);
  }

  function close(): Promise<IteratorResult<T>> {
    stop();
    return Promise.resolve({ done: true, value: undefined });
  }

  // Wrap the readable Iterator in an AsyncGenerator in order to ensure that
  // AsyncIterator Helpers are available where implemented by the runtime.
  const iterator = { next, return: close, throw: close };
  const iterable = { [Symbol.asyncIterator]: () => iterator };
  async function* generator() {
    start();
    yield* iterable;
  }

  return generator();
}
