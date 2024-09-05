import { Readable, Duplex } from "stream";
import { AsyncIterableStream } from "../index";
import { streamLines } from "../source/lines";

declare module "stream" {
  interface Readable {
    streamLines(encoding?: BufferEncoding): AsyncIterableStream<string>;
  }
  interface Duplex {
    streamLines(encoding?: BufferEncoding): AsyncIterableStream<string>;
  }
}

Readable.prototype.streamLines = function (encoding?: BufferEncoding) {
  return streamLines(this, encoding);
};

Duplex.prototype.streamLines = function (encoding?: BufferEncoding) {
  return streamLines(this, encoding);
};
