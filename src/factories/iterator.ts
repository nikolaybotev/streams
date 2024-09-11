// TypeScript Version: >=5.6.2
import { AsyncIteratorStream } from "../async-iterator-stream";
import { IteratorStream } from "../iterator-stream";

declare global {
  interface IteratorObject<T> {
    stream(): IteratorStream<T>;
    streamAsync(): AsyncIteratorStream<T>;
  }
}

const IteratorObjectPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

IteratorObjectPrototype.stream = function () {
  return IteratorStream.from(this);
};

IteratorObjectPrototype.streamAsync = function () {
  return AsyncIteratorStream.from(this);
};
