import { PassThrough, Readable } from "node:stream";

export async function* readableChunks(
  readable: Readable,
  encoding?: BufferEncoding,
): AsyncGenerator<Buffer | string, void, unknown> {
  const passThrough = new PassThrough();

  if (encoding !== undefined) {
    passThrough.setEncoding(encoding);
  }

  // Pipe to a PassThrough duplex stream so as not to destroy the Readable
  // stream when the AsyncGenerator is terminated. This allows te Readable
  // stream to be used again after the AsyncGenerator has completed.
  readable.pipe(passThrough);
  try {
    yield* passThrough;
  } finally {
    // Detach from the Readable stream to release it so it is not potentially
    // holding up the node process. Note that unpipe is not called automatically
    // when the PassThrough stream that is piped to it is destroyed. This is an
    // observed behavior, which is not specified in the Node.js Streams
    // documentation.
    readable.unpipe(passThrough);
  }
}
