import { AsyncIteratorStream } from "../../async-iterator-stream";

declare module "../../async-iterator-stream" {
  interface AsyncIteratorStream<T, TReturn> {
    tee(): Generator<AsyncIteratorStream<T, TReturn>>;
  }
}

AsyncIteratorStream.prototype.tee = function <T, TReturn>(): Generator<
  AsyncIteratorStream<T, TReturn>
> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  const buffers = new Set<IteratorResult<T, TReturn>[]>();

  function next() {
    const buffer = [] as IteratorResult<T, TReturn>[];

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

    return { value: new AsyncIteratorStream<T, TReturn>(tee()) };
  }

  function* asyncIteratorTee() {
    yield* {
      [Symbol.iterator]: () => ({ next }),
    };
  }

  return asyncIteratorTee();
};
