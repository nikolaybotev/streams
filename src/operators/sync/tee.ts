import { IteratorStream, IteratorStreamImpl } from "../../iterator-stream";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    tee(): Generator<IteratorStream<T>>;
  }
  interface IteratorStreamImpl<T> {
    tee(): Generator<IteratorStream<T>>;
  }
}

IteratorStreamImpl.prototype.tee = function <T>(): Generator<
  IteratorStream<T>
> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  const buffers = new Set<IteratorResult<T>[]>();

  function next() {
    const buffer = [] as IteratorResult<T>[];

    buffers.add(buffer);

    function* tee() {
      try {
        while (true) {
          if (buffer.length === 0) {
            const next = self.next();
            buffers.forEach((buffer) => buffer.push(next));
          }
          const item = buffer.shift()!;
          if (item.done) {
            return item.value;
          }
          yield item.value;
        }
      } finally {
        buffers.delete(buffer);
        if (buffers.size === 0) {
          self.return?.();
        }
      }
    }

    return { value: new IteratorStreamImpl(tee()) };
  }

  function* iteratorTee() {
    yield* { [Symbol.iterator]: () => ({ next }) };
  }

  return iteratorTee();
};
