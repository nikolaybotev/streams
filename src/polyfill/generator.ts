import { AsyncIterableStream } from "../index";

declare global {
  interface Generator<T> {
    asyncStream(): AsyncIterableStream<T>;
  }

  interface IterableIterator<T> {
    asyncStream(): AsyncIterableStream<T>;
  }
}

const GeneratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf((function* () {})()),
);

const IterableIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

GeneratorPrototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};

IterableIteratorPrototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};
