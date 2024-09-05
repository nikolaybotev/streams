import { AsyncIteratorStream } from "../index";

declare global {
  interface Generator<T> {
    streamAsync(): AsyncIteratorStream<T>;
  }

  interface IterableIterator<T> {
    streamAsync(): AsyncIteratorStream<T>;
  }
}

const IterableIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

IterableIteratorPrototype.streamAsync = function () {
  return AsyncIteratorStream.from(this);
};
