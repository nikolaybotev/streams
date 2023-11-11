import { Readable, Duplex } from "stream";
import { AsyncStream } from "../index";
import { streamLines } from "../lines";

declare module "stream" {
  interface Readable {
    streamLines(encoding?: BufferEncoding): AsyncStream<string>;
  }
  interface Duplex {
    streamLines(encoding?: BufferEncoding): AsyncStream<string>;
  }
}

Readable.prototype.streamLines = function (encoding?: BufferEncoding) {
  return streamLines(this, encoding);
};

Duplex.prototype.streamLines = function (encoding?: BufferEncoding) {
  return streamLines(this, encoding);
};
