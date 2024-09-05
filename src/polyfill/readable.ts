import { Readable, Duplex } from "stream";
import { streamLines } from "../source/lines";

declare module "stream" {
  interface Readable {
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
  interface Duplex {
    lines(encoding?: BufferEncoding): AsyncIterableIterator<string>;
  }
}

Readable.prototype.lines = function (encoding?: BufferEncoding) {
  return streamLines(this, encoding);
};

Duplex.prototype.lines = function (encoding?: BufferEncoding) {
  return streamLines(this, encoding);
};
