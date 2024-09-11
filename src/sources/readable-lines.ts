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
  if (encoding !== undefined) {
    readable.setEncoding(encoding);
  }
  return AsyncIteratorStream.from(readable).split(
    stringSplitter(separator),
  ) as AsyncGenerator<string, undefined, unknown>;
}
