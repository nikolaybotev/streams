import { AsyncIterableStream } from "../index";

declare global {
  interface AsyncGenerator<T> {
    stream(): AsyncIterableStream<T>;
  }
}

const AsyncGeneratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf((async function* () {})()),
);

AsyncGeneratorPrototype.stream = function () {
  return AsyncIterableStream.from(this);
};
