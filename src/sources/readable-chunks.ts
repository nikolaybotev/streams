import { Readable, Writable } from "node:stream";
import { makeAsyncGeneratorPair } from "../util/async-iterator-pair";
import { makeLazyAsyncGenerator } from "./async-generator";

export function readableChunks(
  readable: Readable,
  encoding?: BufferEncoding,
): AsyncGenerator<Buffer> {
  const [consumer, producer] = makeAsyncGeneratorPair<Buffer>(stop, stop);

  const writable = new Writable({
    defaultEncoding: encoding,
    write(chunk: Buffer, _encoding, callback) {
      const put = producer.next(chunk);

      // Apply back-pressure by awaiting consumption of produced items...
      put.then(() => callback());
    },
  });

  const errorListener = (error) => {
    producer.throw!(error);
  };

  const endListener = () => {
    // Allow consumers to read any buffered data
    producer.return!();
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
    readable.unpipe(writable);
    readable.off("end", endListener);
    readable.off("close", endListener);
    readable.off("error", errorListener);
  }

  return makeLazyAsyncGenerator(start, consumer);
}
