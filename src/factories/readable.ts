import { Readable, Duplex } from "node:stream";
import { readLines } from "../sources/lines";

declare module "node:stream" {
  interface Readable {
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
  interface Duplex {
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
}

Readable.prototype.lines = function (encoding?: BufferEncoding) {
  return readLines(this, encoding);
};

Duplex.prototype.lines = function (encoding?: BufferEncoding) {
  return readLines(this, encoding);
};
