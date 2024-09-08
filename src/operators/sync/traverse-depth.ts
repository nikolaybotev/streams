import { IteratorStream, IteratorStreamImpl } from "../../iterator-stream";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    traverseDepth(getChildren: (_: T) => Iterable<T>): IteratorStream<T>;
  }
  interface IteratorStreamImpl<T> {
    traverseDepth(getChildren: (_: T) => Iterable<T>): IteratorStream<T>;
  }
}

IteratorStreamImpl.prototype.traverseDepth = function <T>(
  getChildren: (_: T) => Iterable<T>,
): IteratorStream<T> {
  function* traverseDepthOperator(it: Iterable<T>) {
    for (const node of it) {
      yield node;
      yield* traverseDepthOperator(getChildren(node));
    }
  }
  return new IteratorStreamImpl(traverseDepthOperator(this));
};
