import { Readable } from "stream";
import { AsyncStream } from "../index";
import { streamLines } from "../lines";

declare module "stream" {
  interface Readable {
    streamLines(encoding?: string): AsyncStream<string>;
  }
}

Readable.prototype.streamLines = function(encoding?: string) {
  return streamLines(this, encoding);
};
