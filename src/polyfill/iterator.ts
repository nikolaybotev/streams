import { AsyncIterableStream } from "../index";

declare global {
  interface Generator<T> {
    streamAsync(): AsyncIterableStream<T>;
  }

  interface IterableIterator<T> {
    streamAsync(): AsyncIterableStream<T>;
  }
}

const IterableIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

IterableIteratorPrototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
