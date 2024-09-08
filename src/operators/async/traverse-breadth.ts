import {
  AsyncIteratorStream,
  AsyncIteratorStreamImpl,
} from "../../async-iterator-stream";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    traverseBreadth(
      getChildren: (_: T) => AsyncIterable<T>,
    ): AsyncIteratorStream<T>;
  }
  interface AsyncIteratorStreamImpl<T> {
    traverseBreadth(
      getChildren: (_: T) => AsyncIterable<T>,
    ): AsyncIteratorStream<T>;
  }
}

AsyncIteratorStreamImpl.prototype.traverseBreadth = function <T>(
  getChildren: (_: T) => AsyncIterable<T>,
): AsyncIteratorStream<T> {
  async function* traverseBreadthOperator(it: AsyncIterable<T>) {
    const queue = [it] as AsyncIterable<T>[];
    let item: AsyncIterable<T> | undefined;
    while ((item = queue.shift()) !== undefined) {
      for await (const node of item) {
        yield node;
        queue.push(getChildren(node));
      }
    }
  }
  return new AsyncIteratorStreamImpl(traverseBreadthOperator(this));
};
