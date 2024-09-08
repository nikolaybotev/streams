import {
  AsyncIteratorStream,
  AsyncIteratorStreamImpl,
} from "../../async-iterator-stream";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    traverseDepth(
      getChildren: (_: T) => AsyncIterable<T>,
    ): AsyncIteratorStream<T>;
  }
  interface AsyncIteratorStreamImpl<T> {
    traverseDepth(
      getChildren: (_: T) => AsyncIterable<T>,
    ): AsyncIteratorStream<T>;
  }
}

AsyncIteratorStreamImpl.prototype.traverseDepth = function <T>(
  getChildren: (_: T) => AsyncIterable<T>,
): AsyncIteratorStream<T> {
  async function* traverseDepthOperator(it: AsyncIterable<T>) {
    for await (const node of it) {
      yield node;
      yield* traverseDepthOperator(getChildren(node));
    }
  }
  return new AsyncIteratorStreamImpl(traverseDepthOperator(this));
};
