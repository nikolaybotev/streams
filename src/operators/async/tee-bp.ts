import { AsyncIteratorStreamImpl } from "../../async-iterator-stream";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T> {
    teeBp(): Generator<AsyncGenerator<T>>;
  }
  interface AsyncIteratorStreamImpl<T> {
    teeBp(): Generator<AsyncGenerator<T>>;
  }
}

AsyncIteratorStreamImpl.prototype.teeBp = function <T>(): Generator<
  AsyncGenerator<T>
> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  const buffers = new Set<IteratorResult<T>[]>();

  function next(): IteratorResult<AsyncGenerator<T>> {
    const buffer = [] as IteratorResult<T>[];

    buffers.add(buffer);

    async function* tee() {
      try {
        while (true) {
          if (buffer.length === 0) {
            const next = await self.next();
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
          await self.return?.();
        }
      }
    }

    return { value: tee() };
  }

  function* asyncIteratorTee() {
    yield* {
      [Symbol.iterator]: () => ({ next }),
    };
  }

  return asyncIteratorTee();
};
