import { IteratorStream } from "../../iterator-stream";
import { splitChunk, Splitter } from "../../util/splitter";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    split<U>(by: Splitter<T, U>): IteratorStream<U, undefined>;
  }
}

IteratorStream.prototype.split = function <T, U>(
  by: Splitter<T, U>,
): IteratorStream<U, undefined> {
  function* splitOperator(it: IteratorStream<T>) {
    let remainder: U | undefined;
    for (const chunk of it) {
      const [items, nextRemainder] = splitChunk(by, chunk, remainder);
      yield* items;
      remainder = nextRemainder;
    }

    if (remainder !== undefined) {
      yield remainder;
    }
  }
  return new IteratorStream(splitOperator(this));
};
