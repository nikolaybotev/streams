import { AsyncIterableStream } from "../index";

declare global {
  interface String {
    charAsyncStream(): AsyncIterableStream<string>;
  }
}

String.prototype.charAsyncStream = function () {
  return AsyncIterableStream.from(this);
};
