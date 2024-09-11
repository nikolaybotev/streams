import { AsyncIteratorStream } from "../../async-iterator-stream";
import { asAsyncIterable } from "../../util/as-async-iterable";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    traverseBreadth(
      getChildren: (
        _: T,
      ) => AsyncIterable<T> | AsyncIterator<T, unknown, undefined>,
    ): AsyncIteratorStream<T>;
  }
}

AsyncIteratorStream.prototype.traverseBreadth = function <T>(
  getChildren: (
    _: T,
  ) => AsyncIterable<T> | AsyncIterator<T, unknown, undefined>,
): AsyncIteratorStream<T> {
  async function* traverseBreadthOperator(it: AsyncIterable<T>) {
    const queue = [it] as AsyncIterable<T>[];
    let item: AsyncIterable<T> | undefined;
    while ((item = queue.shift()) !== undefined) {
      for await (const node of item) {
        yield node;
        queue.push(asAsyncIterable(getChildren(node)));
      }
    }
  }
  return new AsyncIteratorStream(traverseBreadthOperator(this));
};
