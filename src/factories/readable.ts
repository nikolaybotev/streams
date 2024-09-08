import { Readable, Duplex } from "node:stream";
import { readableLines } from "../sources/readable-lines";
import { readableChunks } from "../sources/readable-chunks";

declare module "node:stream" {
  interface Readable {
    chunks(encoding?: BufferEncoding): AsyncIterableIterator<Buffer | string>;
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
  interface Duplex {
    chunks(encoding?: BufferEncoding): AsyncIterableIterator<Buffer | string>;
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
