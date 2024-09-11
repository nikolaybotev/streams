// TypeScript Version: >=5.6.2
import { AsyncIteratorStream } from "../async-iterator-stream";

declare global {
  interface AsyncIteratorObject<T> {
    stream(): AsyncIteratorStream<T>;
  }
}

const AsyncIteratorObjectPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf(Object.getPrototypeOf((async function* () {})())),
);

AsyncIteratorObjectPrototype.stream = function () {
  return AsyncIteratorStream.from(this);
};
