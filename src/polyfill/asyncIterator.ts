import { AsyncIterableStream } from "../index";

declare global {
  interface AsyncIterator<T> {
    stream(): AsyncIterableStream<T>;
  }
}

const AsyncIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf(Object.getPrototypeOf((async function* () {})())),
);

AsyncIteratorPrototype.stream = function () {
  return AsyncIterableStream.from(this);
};
