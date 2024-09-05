import { Readable, Writable } from "node:stream";
import { makePipe } from "../util/pipe";

export function readableChunks(
  readable: Readable,
  encoding?: BufferEncoding,
): AsyncGenerator<Buffer> {
  const { next, ...pipe } = makePipe<Buffer>();

  const writable = new Writable({
    defaultEncoding: encoding,
    write(chunk: Buffer, _encoding, callback) {
      const put = pipe.put({ value: chunk });

      // Apply back-pressure by awaiting consumption of produced items...
      put.then(() => callback());
    },
  });

  const errorListener = (error) => {
    pipe.put({ error });
    stop();
  };

  const endListener = () => {
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

  function stop(): Promise<IteratorResult<Buffer>> {
    pipe.close();
    readable.unpipe(writable);
    readable.off("end", endListener);
    readable.off("close", endListener);
    readable.off("error", errorListener);
    return Promise.resolve({ done: true, value: undefined });
  }

  // Wrap the readable Iterator in an AsyncGenerator in order to ensure that
  // AsyncIterator Helpers are available where implemented by the runtime.
  const iterator = { next, return: stop, throw: stop };
  const iterable = { [Symbol.asyncIterator]: () => iterator };
  async function* generator() {
    start();

    yield* iterable;
  }

  return generator();
}
