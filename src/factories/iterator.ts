import { AsyncIteratorStream } from "../index";
import { IteratorStream } from "../sync";

declare global {
  interface Generator<T> {
    stream(): IteratorStream<T>;
    streamAsync(): AsyncIteratorStream<T>;
  }

  interface IterableIterator<T> {
    stream(): IteratorStream<T>;
    streamAsync(): AsyncIteratorStream<T>;
  }
}

const IterableIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

IterableIteratorPrototype.stream = function () {
  return IteratorStream.from(this);
};

IterableIteratorPrototype.streamAsync = function () {
  return AsyncIteratorStream.from(this);
};
