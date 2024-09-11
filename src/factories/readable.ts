import { Readable } from "node:stream";
import { LinesOptions, readableLines } from "../sources/readable-lines";
import { readableChunks } from "../sources/readable-chunks";

declare module "node:stream" {
  interface Readable {
    chunks(
      encoding?: BufferEncoding,
    ): AsyncGenerator<Buffer | string, undefined, unknown>;
    lines(options?: LinesOptions): AsyncGenerator<string, undefined, unknown>;
  }
  interface Duplex {
    chunks(encoding?: BufferEncoding): AsyncGenerator<Buffer | string>;
    lines(options?: LinesOptions): AsyncGenerator<string>;
  }
}

Readable.prototype.chunks = function (encoding?: BufferEncoding) {
  return readableChunks(this, encoding);
};

Readable.prototype.lines = function (options?: LinesOptions) {
  return readableLines(this, options);
};
