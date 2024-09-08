import { IteratorStreamImpl } from "../../iterator-stream";
import { Splitter } from "../../util/splitter";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    split<B, R = B>(by: Splitter<T, B, R>): Generator<B>;
  }
  interface IteratorStreamImpl<T> {
    split<B, R = B>(by: Splitter<T, B, R>): Generator<B>;
  }
}

IteratorStreamImpl.prototype.split = function* <T, U, R>(
  by: Splitter<T, U, R>,
): Generator<U, void, undefined> {
  let remainder = by.initial();
  try {
    for (const chunk of this) {
      const [items, nextRemainder] = by.split(chunk, remainder);
      yield* items;
      remainder = nextRemainder;
    }
  } finally {
    const lastItem = by.last(remainder);
    if (lastItem !== null) {
      yield lastItem;
    }
  }
};
