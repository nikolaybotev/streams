import {
  AsyncIteratorStream,
  AsyncIteratorStreamImpl,
} from "../../async-iterator-stream";
import { Splitter } from "../../util/splitter";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    split<B, R = B>(by: Splitter<T, B, R>): AsyncIteratorStream<B>;
  }
  interface AsyncIteratorStreamImpl<T> {
    split<B, R = B>(by: Splitter<T, B, R>): AsyncIteratorStream<B>;
  }
}

AsyncIteratorStreamImpl.prototype.split = function <T, U, R>(
  by: Splitter<T, U, R>,
): AsyncIteratorStream<U> {
  async function* splitOperator(it: AsyncIteratorStream<T>) {
    let remainder = by.initial();
    for await (const chunk of it) {
      const [items, nextRemainder] = by.split(chunk, remainder);
      yield* items;
      remainder = nextRemainder;
    }

    const lastItem = by.last(remainder);
    if (lastItem !== null) {
      yield lastItem;
    }
  }
  return new AsyncIteratorStreamImpl(splitOperator(this));
};
