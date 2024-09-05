import { AsyncIterableStream } from "../index";

declare global {
  interface Array<T> {
    asyncStream(): AsyncIterableStream<T>;
  }
}

Array.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
