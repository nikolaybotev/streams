import { Readable, Writable } from "node:stream";
import { makePipe } from "../util/pipe";
import { makeAsyncGenerator } from "./asyncGenerator";

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

  function stop() {
    pipe.close();
    readable.unpipe(writable);
    readable.off("end", endListener);
    readable.off("close", endListener);
    readable.off("error", errorListener);
  }

  return makeAsyncGenerator(start, next, stop);
}
