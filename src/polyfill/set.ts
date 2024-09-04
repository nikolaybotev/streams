import { AsyncStream } from "../index";

declare global {
  interface Set<T> {
    asyncStream(): AsyncStream<T>;
  }
}

Set.prototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
