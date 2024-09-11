import { AsyncIteratorStream } from "../../async-iterator-stream";
import { splitChunk, Splitter } from "../../util/splitter";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    split<U>(by: Splitter<T, U>): AsyncIteratorStream<U, undefined>;
  }
}

AsyncIteratorStream.prototype.split = function <T, U>(
  by: Splitter<T, U>,
): AsyncIteratorStream<U, undefined> {
  async function* splitOperator(it: AsyncIteratorStream<T>) {
    let remainder: U | undefined;
    for await (const chunk of it) {
      const [items, nextRemainder] = splitChunk(by, chunk, remainder);
      yield* items;
      remainder = nextRemainder;
    }

    if (remainder !== undefined) {
      yield remainder;
    }
  }
  return new AsyncIteratorStream(splitOperator(this));
};
