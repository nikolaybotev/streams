import "../operators/async/split";
import { Readable } from "node:stream";
import { stringSplitter } from "../util/splitter";
import { AsyncIteratorStream } from "../async-iterator-stream";

export type LinesOptions = {
  encoding?: BufferEncoding;
  separator?: string | RegExp;
};

export function readableLines(
  readable: Readable,
  { encoding, separator }: LinesOptions = { encoding: "utf-8" },
): AsyncGenerator<string, undefined, unknown> {
  async function* readableLinesGenerator() {
    if (encoding !== undefined) {
      readable.setEncoding(encoding);
    }
    yield* AsyncIteratorStream.from(readable).split(stringSplitter(separator));
  }

  return readableLinesGenerator() as AsyncGenerator<string, undefined, unknown>;
}
