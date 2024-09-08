import { IteratorStream, IteratorStreamImpl } from "../../iterator-stream";
import { handleChunk, Splitter } from "../../util/splitter";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    split<U>(by: Splitter<T, U>): IteratorStream<U>;
  }
  interface IteratorStreamImpl<T> {
    split<U>(by: Splitter<T, U>): IteratorStream<U>;
  }
}

IteratorStreamImpl.prototype.split = function <T, U>(
  by: Splitter<T, U>,
): IteratorStream<U> {
  function* splitOperator(it: IteratorStream<T>) {
    let remainder: U | undefined;
    for (const chunk of it) {
      const [items, nextRemainder] = handleChunk(by, chunk, remainder);
      yield* items;
      remainder = nextRemainder;
    }

    if (remainder !== undefined) {
      yield remainder;
    }
  }
  return new IteratorStreamImpl(splitOperator(this));
};
