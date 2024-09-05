import { Readable, Duplex } from "node:stream";
import { readableLines } from "../sources/readableLines";

declare module "node:stream" {
  interface Readable {
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
  interface Duplex {
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
}

Readable.prototype.lines = function (encoding?: BufferEncoding) {
  return readableLines(this, encoding);
};

Duplex.prototype.lines = function (encoding?: BufferEncoding) {
  return readableLines(this, encoding);
};
