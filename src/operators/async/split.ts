import { AsyncIteratorStreamImpl } from "../../async-iterator-stream";
import { Splitter } from "../../util/splitter";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    split<B, R = B>(by: Splitter<T, B, R>): AsyncGenerator<B>;
  }
  interface AsyncIteratorStreamImpl<T> {
    split<B, R = B>(by: Splitter<T, B, R>): AsyncGenerator<B>;
  }
}

AsyncIteratorStreamImpl.prototype.split = async function* <T, U, R>(
  by: Splitter<T, U, R>,
): AsyncGenerator<U, void, undefined> {
  let remainder = by.initial();
  try {
    for await (const chunk of this) {
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
