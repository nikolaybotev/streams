import { IteratorStream } from "../../iterator-stream";

declare module "../../iterator-stream" {
  interface IteratorStream<T> {
    tee(): Generator<IteratorStream<T>>;
  }
}

IteratorStream.prototype.tee = function <T>(): Generator<IteratorStream<T>> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  const buffers = new Set<IteratorResult<T, undefined>[]>();

  function next() {
    const buffer = [] as IteratorResult<T, undefined>[];

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

    return { value: new IteratorStream<T>(tee()) };
  }

  function* iteratorTee() {
    yield* { [Symbol.iterator]: () => ({ next }) };
  }

  return iteratorTee();
};
