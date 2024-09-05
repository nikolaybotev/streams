import { Readable, Duplex } from "node:stream";
import { readableLines } from "../sources/readableLines";
import { readableChunks } from "../sources/readableChunks";

declare module "node:stream" {
  interface Readable {
    chunks(encoding?: BufferEncoding): AsyncIterableIterator<Buffer>;
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
  interface Duplex {
    chunks(encoding?: BufferEncoding): AsyncIterableIterator<Buffer>;
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
}

Readable.prototype.chunks = function (encoding?: BufferEncoding) {
  return readableChunks(this, encoding);
};

Readable.prototype.lines = function (encoding?: BufferEncoding) {
  return readableLines(this, encoding);
};

Duplex.prototype.chunks = function (encoding?: BufferEncoding) {
  return readableChunks(this, encoding);
};

Duplex.prototype.lines = function (encoding?: BufferEncoding) {
  return readableLines(this, encoding);
};
