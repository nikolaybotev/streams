import { AsyncStream, streamAsyncIterable } from "../index";

declare global {
  interface AsyncGenerator<T> {
    stream(): AsyncStream<T>;
  }
}

const AsyncGeneratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf((async function* () {})()),
);

AsyncGeneratorPrototype.stream = function () {
  return streamAsyncIterable(this);
};
