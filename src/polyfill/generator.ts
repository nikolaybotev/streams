import { AsyncStream } from "../index";

declare global {
  interface Generator<T> {
    asyncStream(): AsyncStream<T>;
  }

  interface IterableIterator<T> {
    asyncStream(): AsyncStream<T>;
  }
}

const GeneratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf((function* () {})()),
);

const IterableIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

GeneratorPrototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};

IterableIteratorPrototype.asyncStream = function () {
  return AsyncStream.fromIterable(this);
};
