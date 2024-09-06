import { AsyncIteratorStream } from "../async-iterator-stream";

declare global {
  interface AsyncGenerator<T> {
    stream(): AsyncIteratorStream<T>;
  }

  interface AsyncIterableIterator<T> {
    stream(): AsyncIteratorStream<T>;
  }
}

const AsyncIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf(Object.getPrototypeOf((async function* () {})())),
);

AsyncIteratorPrototype.stream = function () {
  return AsyncIteratorStream.from(this);
};
