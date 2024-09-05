import { AsyncIterableStream } from "../index";

declare global {
  interface Generator<T> {
    streamAsync(): AsyncIterableStream<T>;
  }

  interface IterableIterator<T> {
    streamAsync(): AsyncIterableStream<T>;
  }
}

const GeneratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf((function* () {})()),
);

const IterableIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

GeneratorPrototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};

IterableIteratorPrototype.streamAsync = function () {
  return AsyncIterableStream.from(this);
};
