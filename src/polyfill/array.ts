import { AsyncIterableStream } from "../index";

declare global {
  interface Array<T> {
    streamAsync(): AsyncIterableStream<T>;
  }
}

Array.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
