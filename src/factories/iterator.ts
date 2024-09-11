// TypeScript Version: >=5.6.2
import { IteratorStream } from "../iterator-stream";
import { toAsync } from "../sources/iterator";

declare global {
  interface IteratorObject<T> {
    stream(): IteratorStream<T>;
    toAsync(): AsyncGenerator<T>;
  }
}

const IteratorObjectPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf([].values()),
);

IteratorObjectPrototype.stream = function () {
  return IteratorStream.from(this);
};

IteratorObjectPrototype.toAsync = function () {
  return toAsync(this);
};
