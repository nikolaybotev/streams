import { AsyncIterableStream } from "../index";

declare global {
  interface Set<T> {
    streamAsync(): AsyncIterableStream<T>;
  }
}

Set.prototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
