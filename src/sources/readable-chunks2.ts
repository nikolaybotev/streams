import { PassThrough, Readable } from "node:stream";

export async function* readableChunks(
  readable: Readable,
  encoding?: BufferEncoding,
): AsyncGenerator<Buffer, void, undefined> {
  if (encoding !== undefined) {
    readable.setEncoding(encoding);
  }

  const passThrough = new PassThrough();

  // Pipe to a passthrough so as not to destroy the readable stream when the
  // AsyncGenerator is interrupted before reaching the end of the stream.
  readable.pipe(passThrough);
  try {
    yield* passThrough;
  } finally {
    // Detach from the readable stream - unpipe is not called automatically
    // when the passThrough stream is destroyed.
    readable.unpipe(passThrough);
  }
}
