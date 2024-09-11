import { IteratorStream } from "../../iterator-stream";
import { asIterable } from "../../util/as-iterable";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    traverseBreadth(
      getChildren: (_: T) => Iterable<T> | Iterator<T, unknown, undefined>,
    ): IteratorStream<T>;
  }
}

IteratorStream.prototype.traverseBreadth = function <T>(
  getChildren: (_: T) => Iterable<T> | Iterator<T, unknown, undefined>,
): IteratorStream<T> {
  function* traverseBreadthOperator(it: Iterable<T>) {
    const queue = [it] as Iterable<T>[];
    let item: Iterable<T> | undefined;
    while ((item = queue.shift()) !== undefined) {
      for (const node of item) {
        yield node;
        queue.push(asIterable(getChildren(node)));
      }
    }
  }
  return new IteratorStream(traverseBreadthOperator(this));
};
