import { AsyncIterableStream } from "../index";

declare global {
  interface AsyncGenerator<T> {
    stream(): AsyncIterableStream<T>;
  }

  interface AsyncIterableIterator<T> {
    stream(): AsyncIterableStream<T>;
  }
}

const AsyncIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf(Object.getPrototypeOf((async function* () {})())),
);

AsyncIteratorPrototype.stream = function () {
  return AsyncIterableStream.from(this);
};
