import { IteratorStream } from "../../iterator-stream";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    traverseBreadth(getChildren: (_: T) => Iterable<T>): IteratorStream<T>;
  }
}

IteratorStream.prototype.traverseBreadth = function <T>(
  getChildren: (_: T) => Iterable<T>,
): IteratorStream<T> {
  function* traverseBreadthOperator(it: Iterable<T>) {
    const queue = [it] as Iterable<T>[];
    let item: Iterable<T> | undefined;
    while ((item = queue.shift()) !== undefined) {
      for (const node of item) {
        yield node;
        queue.push(getChildren(node));
      }
    }
  }
  return new IteratorStream(traverseBreadthOperator(this));
};
