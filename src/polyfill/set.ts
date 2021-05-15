import { AsyncStream, asyncStreamIterable } from "../index";

declare global {
  interface Set<T> {
    asyncStream(): AsyncStream<T>;
  }
}

Set.prototype.asyncStream = function () {
  return asyncStreamIterable(this);
};
