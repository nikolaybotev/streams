import { Readable } from "stream";
import { AsyncStream } from "../index";
import { streamLines } from "../lines";

declare module "stream" {
  interface Readable {
    streamLines(encoding?: BufferEncoding): AsyncStream<string>;
  }
}

Readable.prototype.streamLines = function (encoding?: BufferEncoding) {
  return streamLines(this, encoding);
};
