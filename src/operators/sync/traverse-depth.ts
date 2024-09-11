import { IteratorStream } from "../../iterator-stream";
import { asIterable } from "../../util/as-iterable";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    traverseDepth(
      getChildren: (_: T) => Iterable<T> | Iterator<T, unknown, undefined>,
    ): IteratorStream<T, undefined>;
  }
}

IteratorStream.prototype.traverseDepth = function <T>(
  getChildren: (_: T) => Iterable<T> | Iterator<T, unknown, undefined>,
): IteratorStream<T, undefined> {
  function* traverseDepthOperator(it: Iterable<T>) {
    for (const node of it) {
      yield node;
      yield* traverseDepthOperator(asIterable(getChildren(node)));
    }
  }
  return new IteratorStream(traverseDepthOperator(this));
};
