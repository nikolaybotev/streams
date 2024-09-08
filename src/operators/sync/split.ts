import { IteratorStream, IteratorStreamImpl } from "../../iterator-stream";
import { Splitter } from "../../util/splitter";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    split<B, R = B>(by: Splitter<T, B, R>): IteratorStream<B>;
  }
  interface IteratorStreamImpl<T> {
    split<B, R = B>(by: Splitter<T, B, R>): IteratorStream<B>;
  }
}

IteratorStreamImpl.prototype.split = function <T, U, R>(
  by: Splitter<T, U, R>,
): IteratorStream<U> {
  function* splitOperator(it: IteratorStream<T>) {
    let remainder = by.initial();
    for (const chunk of it) {
      const [items, nextRemainder] = by.split(chunk, remainder);
      yield* items;
      remainder = nextRemainder;
    }

    const lastItem = by.last(remainder);
    if (lastItem !== null) {
      yield lastItem;
    }
  }
  return new IteratorStreamImpl(splitOperator(this));
};
