import { AsyncIteratorStream } from "../../async-iterator-stream";
import { asAsyncIterable } from "../../util/as-async-iterable";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    traverseDepth(
      getChildren: (
        _: T,
      ) => AsyncIterable<T> | AsyncIterator<T, unknown, undefined>,
    ): AsyncIteratorStream<T, undefined>;
  }
}

AsyncIteratorStream.prototype.traverseDepth = function <T>(
  getChildren: (
    _: T,
  ) => AsyncIterable<T> | AsyncIterator<T, unknown, undefined>,
): AsyncIteratorStream<T, undefined> {
  async function* traverseDepthOperator(it: AsyncIterable<T>) {
    for await (const node of it) {
      yield node;
      yield* traverseDepthOperator(asAsyncIterable(getChildren(node)));
    }
  }
  return new AsyncIteratorStream(traverseDepthOperator(this));
};
