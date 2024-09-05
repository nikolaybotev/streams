import { AsyncIterableStream } from "../index";

declare global {
  interface Set<T> {
    asyncStream(): AsyncIterableStream<T>;
  }
}

Set.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
