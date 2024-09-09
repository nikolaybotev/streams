import { Readable } from "node:stream";
import { LinesOptions, readableLines } from "../sources/readable-lines";
import { readableChunks } from "../sources/readable-chunks";

declare module "node:stream" {
  interface Readable {
    chunks(encoding?: BufferEncoding): AsyncIterableIterator<Buffer | string>;
    lines(options?: LinesOptions): AsyncIterableIterator<string>;
  }
  interface Duplex {
    chunks(encoding?: BufferEncoding): AsyncIterableIterator<Buffer | string>;
    lines(options?: LinesOptions): AsyncIterableIterator<string>;
  }
}

Readable.prototype.chunks = function (encoding?: BufferEncoding) {
  return readableChunks(this, encoding);
};

Readable.prototype.lines = function (options?: LinesOptions) {
  return readableLines(this, options);
};
