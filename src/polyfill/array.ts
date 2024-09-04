import { AsyncStream } from "../index";

declare global {
  interface Array<T> {
    asyncStream(): AsyncStream<T>;
  }
}

Array.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
